import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Processor('ai-generation')
export class AiBuilderProcessor {
  private readonly logger = new Logger(AiBuilderProcessor.name);
  private genAI: GoogleGenerativeAI;

  constructor(private prisma: PrismaService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  @Process('generate-page')
  async handlePageGeneration(job: Job) {
    const { generationId, tenantId, prompt } = job.data;
    this.logger.log(`Processing page generation ${generationId} for tenant ${tenantId}`);
    
    try {
      await job.progress(10);
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      // Layer 1: Prompt Understanding
      // In a full architecture, this would be a separate model call to extract schema and intent.
      await job.progress(30);

      // Layer 2: Layout Generation Engine
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
      } catch (e) {
        throw new Error('Failed to parse AI JSON response');
      }
      
      await job.progress(70);

      // Layer 3: CMS Compiler Engine
      // Persist to database
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

      // Update generation record
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
    } catch (error: any) {
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

  @Process('generate-section')
  async handleSectionGeneration(job: Job) {
    // Similar flow for isolated section generation
    return { success: true };
  }
}
