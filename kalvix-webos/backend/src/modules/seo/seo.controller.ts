import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SeoService } from './seo.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('seo')
export class SeoController {
  constructor(private seoService: SeoService) {}

  @Post('gsc/metrics')
  // @UseGuards(AuthGuard('jwt')) // Enable this for production admin auth
  async getGscMetrics(@Body() credentials?: { clientEmail?: string, privateKey?: string, siteUrl?: string }) {
    return this.seoService.getGscMetrics(credentials);
  }
}
