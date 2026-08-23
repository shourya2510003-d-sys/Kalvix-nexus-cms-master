import { Controller, Post, Body } from '@nestjs/common';
import { CustomerAiService } from './customer-ai.service';

@Controller('customer-ai')
export class CustomerAiController {
  constructor(private customerAiService: CustomerAiService) {}

  @Post('chat')
  async chat(@Body() body: { message: string; history?: any[] }) {
    return this.customerAiService.handleChat(body.message, body.history || []);
  }
}
