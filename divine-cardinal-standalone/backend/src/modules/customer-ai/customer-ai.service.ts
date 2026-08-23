import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerAiService {
  private readonly logger = new Logger(CustomerAiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private prisma: PrismaService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async handleChat(message: string, history: any[]) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return { reply: "I'm currently offline (API key not configured). Please try again later!" };
      }

      // Security System Prompt to lock down the assistant to only customer-safe interactions
      const systemPrompt = `
      You are an AI Shopping Assistant for the Divine Cardinal storefront.
      Your ONLY purpose is to assist customers with:
      - Product recommendations
      - Store FAQs, Shipping, Returns
      - Order tracking queries (if they provide order numbers)

      CRITICAL SECURITY RULES:
      1. NEVER acknowledge, reveal, or access CMS templates, layouts, global components, themes, admin settings, or backend systems.
      2. If a user asks about building pages, generating layouts, or modifying the website, politely decline and state you are only a shopping assistant.
      3. Do not execute code or reveal environment secrets.
      `;

      // Fetch products to give context to the AI (basic RAG simulation)
      const products = await this.prisma.product.findMany({
        take: 5,
        select: { name: true, description: true, basePrice: true, status: true },
        where: { status: 'ACTIVE' }
      });
      
      const productContext = `\nHere are some of our active products for context: \n${JSON.stringify(products)}`;

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt + productContext }] },
          { role: 'model', parts: [{ text: "Understood. I am the Shopping Assistant for Divine Cardinal." }]},
          ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] }))
        ]
      });

      const result = await chat.sendMessage(message);
      return { reply: result.response.text() };

    } catch (error: any) {
      this.logger.error('Error in Customer AI chat', error.message);
      return { reply: "I'm having trouble connecting right now. Please try again later!" };
    }
  }
}
