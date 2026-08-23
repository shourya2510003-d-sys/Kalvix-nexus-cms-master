import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CmsModule } from './modules/cms/cms.module';

import { SeoModule } from './modules/seo/seo.module';

import { AiBuilderModule } from './modules/ai-builder/ai-builder.module';
import { CustomerAiModule } from './modules/customer-ai/customer-ai.module';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/roles.guard';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    BullModule.forRoot({
      redis: process.env.REDIS_URL || 'redis://localhost:6379',
    }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    CmsModule,
    SeoModule,
    AiBuilderModule,
    CustomerAiModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
