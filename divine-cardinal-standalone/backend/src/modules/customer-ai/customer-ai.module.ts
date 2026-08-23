import { Module } from '@nestjs/common';
import { CustomerAiController } from './customer-ai.controller';
import { CustomerAiService } from './customer-ai.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerAiController],
  providers: [CustomerAiService],
  exports: [CustomerAiService],
})
export class CustomerAiModule {}
