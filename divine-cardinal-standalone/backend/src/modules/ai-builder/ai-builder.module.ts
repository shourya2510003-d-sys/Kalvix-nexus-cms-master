import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AiBuilderController } from './ai-builder.controller';
import { AiBuilderService } from './ai-builder.service';
import { AiBuilderProcessor } from './ai-builder.processor';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'ai-generation',
    }),
  ],
  controllers: [AiBuilderController],
  providers: [AiBuilderService, AiBuilderProcessor],
  exports: [AiBuilderService],
})
export class AiBuilderModule {}
