"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CustomerAiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAiService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const prisma_service_1 = require("../../prisma/prisma.service");
let CustomerAiService = CustomerAiService_1 = class CustomerAiService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CustomerAiService_1.name);
        this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }
    async handleChat(message, history) {
        try {
            if (!process.env.GEMINI_API_KEY) {
                return { reply: "I'm currently offline (API key not configured). Please try again later!" };
            }
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
                    { role: 'model', parts: [{ text: "Understood. I am the Shopping Assistant for Divine Cardinal." }] },
                    ...history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.content }] }))
                ]
            });
            const result = await chat.sendMessage(message);
            return { reply: result.response.text() };
        }
        catch (error) {
            this.logger.error('Error in Customer AI chat', error.message);
            return { reply: "I'm having trouble connecting right now. Please try again later!" };
        }
    }
};
exports.CustomerAiService = CustomerAiService;
exports.CustomerAiService = CustomerAiService = CustomerAiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerAiService);
//# sourceMappingURL=customer-ai.service.js.map