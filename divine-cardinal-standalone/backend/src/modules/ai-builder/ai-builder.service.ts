import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class AiBuilderService {
  private readonly logger = new Logger(AiBuilderService.name);

  constructor(
    @InjectQueue('ai-generation') private aiQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async queuePageGeneration(tenantId: string, prompt: string) {
    this.logger.log(`Queueing page generation for tenant: ${tenantId}`);
    
    // Create tracking record
    const generation = await this.prisma.aiGeneration.create({
      data: {
        tenantId,
        prompt,
        category: 'page',
        generatedJson: {}, // Placeholder
      }
    });

    const job = await this.aiQueue.add('generate-page', {
      generationId: generation.id,
      tenantId,
      prompt,
    });

    return { success: true, jobId: job.id, generationId: generation.id };
  }

  async queueSectionGeneration(tenantId: string, pageId: string, prompt: string) {
    this.logger.log(`Queueing section generation for page: ${pageId}`);
    
    const generation = await this.prisma.aiGeneration.create({
      data: {
        tenantId,
        prompt,
        category: 'section',
        generatedJson: {}, // Placeholder
      }
    });

    const job = await this.aiQueue.add('generate-section', {
      generationId: generation.id,
      tenantId,
      pageId,
      prompt,
    });

    return { success: true, jobId: job.id, generationId: generation.id };
  }

  async getJobStatus(jobId: string) {
    const job = await this.aiQueue.getJob(jobId);
    if (!job) {
      return { status: 'not-found' };
    }
    
    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      status: state,
      progress,
      result,
      error: failedReason,
    };
  }

  async parseSeoDoc(documentText: string) {
    this.logger.log(`Parsing SEO Document...`);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in the environment');
      }

      const systemPrompt = `
      You are an expert SEO and E-commerce data extraction assistant.
      Your task is to parse the provided raw text document and extract its structured contents perfectly into JSON format.
      
      CRITICAL INSTRUCTIONS FOR FORMATTING:
      - For "longDescription", you MUST use valid HTML tags for formatting (e.g., <p> for paragraphs, <strong> or <b> for bolding main points). DO NOT use Markdown. Return a single HTML string.
      - For "howToUse", "ingredientBreakdown", and "regulatoryNote", use PLAIN TEXT only. DO NOT use any HTML tags like <p>, <strong>, or <a>. Use standard line breaks (\n) for separating lines and paragraphs.

      Expected JSON Format:
      {
        "seoTitle": "String - The SEO Title Tag",
        "seoDescription": "String - The Meta Description",
        "slug": "String - URL Slug",
        "quickFacts": [{"key": "String", "value": "String"}],
        "shortDescription": "String - Use the Meta Description or a 1-2 sentence summary for the top of the product page",
        "longDescription": "String - The full product description body (Must use HTML tags for bolding and paragraphs)",
        "keyBenefits": ["String - Extract Section 7 (Key Benefits) as an array of strings"],
        "ingredientBreakdown": "String - Extract Section 8 (Ingredient Breakdown) using PLAIN TEXT and newlines only. No HTML.",
        "howToUse": "String - Extract Section 9 (How to Use) using PLAIN TEXT and newlines only. No HTML.",
        "whoItsFor": "String - Extract Section 10 (Who It's For)",
        "faqs": [{"question": "String", "answer": "String"}],
        "structuredData": "String - raw JSON-LD as a string",
        "altText": ["String"],
        "internalLinks": ["String"],
        "regulatoryNote": "String - Extract Section 16 (Regulatory / Claim-Language Note) using PLAIN TEXT only. No HTML."
      }
      
      Ensure you extract all requested sections accurately from the provided text, especially 7, 8, 9, 10, and 16. Output only valid JSON.
      `;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const result = await model.generateContent(documentText);
      const response = await result.response;
      let responseText = response.text();
      
      // Clean markdown formatting if present
      responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      let generatedJson;
      try {
        generatedJson = JSON.parse(responseText);
      } catch (e: any) {
        this.logger.error(`Failed to parse AI JSON response: ${responseText}`);
        return { success: false, error: 'Failed to parse AI JSON response', rawResponse: responseText };
      }
      
      return { success: true, data: generatedJson };
    } catch (error: any) {
      this.logger.error(`Document parsing failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
