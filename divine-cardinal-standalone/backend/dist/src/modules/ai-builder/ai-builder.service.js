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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AiBuilderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiBuilderService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../prisma/prisma.service");
let AiBuilderService = AiBuilderService_1 = class AiBuilderService {
    constructor(aiQueue, prisma) {
        this.aiQueue = aiQueue;
        this.prisma = prisma;
        this.logger = new common_1.Logger(AiBuilderService_1.name);
    }
    async queuePageGeneration(tenantId, prompt) {
        this.logger.log(`Queueing page generation for tenant: ${tenantId}`);
        const generation = await this.prisma.aiGeneration.create({
            data: {
                tenantId,
                prompt,
                category: 'page',
                generatedJson: {},
            }
        });
        const job = await this.aiQueue.add('generate-page', {
            generationId: generation.id,
            tenantId,
            prompt,
        });
        return { success: true, jobId: job.id, generationId: generation.id };
    }
    async queueSectionGeneration(tenantId, pageId, prompt) {
        this.logger.log(`Queueing section generation for page: ${pageId}`);
        const generation = await this.prisma.aiGeneration.create({
            data: {
                tenantId,
                prompt,
                category: 'section',
                generatedJson: {},
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
    async getJobStatus(jobId) {
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
    async parseSeoDoc(documentText) {
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
            const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                systemInstruction: systemPrompt,
                generationConfig: { responseMimeType: 'application/json' },
            });
            const result = await model.generateContent(documentText);
            const response = await result.response;
            let responseText = response.text();
            responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            let generatedJson;
            try {
                generatedJson = JSON.parse(responseText);
            }
            catch (e) {
                this.logger.error(`Failed to parse AI JSON response: ${responseText}`);
                return { success: false, error: 'Failed to parse AI JSON response', rawResponse: responseText };
            }
            return { success: true, data: generatedJson };
        }
        catch (error) {
            this.logger.error(`Document parsing failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
};
exports.AiBuilderService = AiBuilderService;
exports.AiBuilderService = AiBuilderService = AiBuilderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('ai-generation')),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], AiBuilderService);
//# sourceMappingURL=ai-builder.service.js.map