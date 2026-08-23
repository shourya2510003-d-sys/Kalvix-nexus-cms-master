import { Module } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CmsController } from './cms.controller';
import { AdminController } from './admin.controller';

@Module({
  providers: [CmsService],
  controllers: [CmsController, AdminController],
  exports: [CmsService],
})
export class CmsModule {}
