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
var AiBuilderProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiBuilderProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const generative_ai_1 = require("@google/generative-ai");
let AiBuilderProcessor = AiBuilderProcessor_1 = class AiBuilderProcessor {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AiBuilderProcessor_1.name);
        this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }
    async handlePageGeneration(job) {
        const { generationId, tenantId, prompt } = job.data;
        this.logger.log(`Processing page generation ${generationId} for tenant ${tenantId}`);
        try {
            await job.progress(10);
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY is not configured');
            }
            await job.progress(30);
            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
            const systemPrompt = `
      You are an expert CMS Layout Generator. You output strictly structured JSON.
      Generate a comprehensive page layout based on the user's prompt.
      
      Expected JSON Format:
      {
        "page": {
          "title": "Page Title",
          "slug": "page-slug",
          "sections": [
            {
              "name": "Hero Section",
              "type": "hero",
              "config": { ... },
              "components": [
                {
                  "type": "text",
                  "config": { "content": "Welcome", "tag": "h1" }
                }
              ]
            }
          ]
        }
      }
      
      Never output markdown, only valid JSON.
      `;
            const chat = model.startChat({
                history: [{ role: 'user', parts: [{ text: systemPrompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                }
            });
            const result = await chat.sendMessage(prompt);
            const responseText = result.response.text();
            let generatedJson;
            try {
                generatedJson = JSON.parse(responseText);
            }
            catch (e) {
                throw new Error('Failed to parse AI JSON response');
            }
            await job.progress(70);
            const page = await this.prisma.cmsPage.create({
                data: {
                    tenantId,
                    title: generatedJson.page.title || 'Generated Page',
                    slug: generatedJson.page.slug || `page-${Date.now()}`,
                    status: 'DRAFT',
                    version: 1,
                }
            });
            for (const sectionData of (generatedJson.page.sections || [])) {
                const section = await this.prisma.cmsSection.create({
                    data: {
                        tenantId,
                        pageId: page.id,
                        name: sectionData.name || 'Section',
                        type: sectionData.type || 'generic',
                        config: sectionData.config || {},
                        order: 0,
                    }
                });
                for (const compData of (sectionData.components || [])) {
                    await this.prisma.cmsComponent.create({
                        data: {
                            tenantId,
                            sectionId: section.id,
                            type: compData.type || 'text',
                            config: compData.config || {},
                        }
                    });
                }
            }
            await job.progress(90);
            await this.prisma.aiGeneration.update({
                where: { id: generationId },
                data: {
                    generatedJson: generatedJson,
                    response: {
                        message: 'Successfully generated and compiled page to CMS',
                        pageId: page.id
                    }
                }
            });
            await job.progress(100);
            return { success: true, pageId: page.id };
        }
        catch (error) {
            this.logger.error(`Generation failed: ${error.message}`);
            await this.prisma.aiGeneration.update({
                where: { id: generationId },
                data: {
                    response: { error: error.message }
                }
            });
            throw error;
        }
    }
    async handleSectionGeneration(job) {
        return { success: true };
    }
};
exports.AiBuilderProcessor = AiBuilderProcessor;
__decorate([
    (0, bull_1.Process)('generate-page'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiBuilderProcessor.prototype, "handlePageGeneration", null);
__decorate([
    (0, bull_1.Process)('generate-section'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiBuilderProcessor.prototype, "handleSectionGeneration", null);
exports.AiBuilderProcessor = AiBuilderProcessor = AiBuilderProcessor_1 = __decorate([
    (0, bull_1.Processor)('ai-generation'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiBuilderProcessor);
//# sourceMappingURL=ai-builder.processor.js.map