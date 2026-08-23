import { Controller, Post, Body, Get, Param, UseGuards, Sse } from '@nestjs/common';
import { AiBuilderService } from './ai-builder.service';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Controller('ai-builder')
export class AiBuilderController {
  constructor(private aiBuilderService: AiBuilderService) {}

  @Post('generate/page')
  @UseGuards(AuthGuard('jwt'))
  async generatePage(@Body() body: { prompt: string; tenantId: string }) {
    const { prompt, tenantId } = body;
    return this.aiBuilderService.queuePageGeneration(tenantId, prompt);
  }

  @Post('generate/section')
  @UseGuards(AuthGuard('jwt'))
  async generateSection(@Body() body: { prompt: string; tenantId: string; pageId: string }) {
    const { prompt, tenantId, pageId } = body;
    return this.aiBuilderService.queueSectionGeneration(tenantId, pageId, prompt);
  }
  
  @Get('status/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.aiBuilderService.getJobStatus(jobId);
  }

  @Post('parse-seo-doc')
  @UseGuards(AuthGuard('jwt'))
  async parseSeoDoc(@Body() body: { documentText: string }) {
    return this.aiBuilderService.parseSeoDoc(body.documentText);
  }
}
