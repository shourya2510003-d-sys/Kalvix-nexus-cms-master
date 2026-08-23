import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Successfully connected to database');
    } catch (error) {
      console.error('Failed to connect to database on startup:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
