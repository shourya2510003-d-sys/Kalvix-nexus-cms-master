import { Controller, Get, Post, Delete, Body, Param, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { Request } from 'express';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private cmsService: CmsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadFile(@UploadedFile() file: any, @Req() req: Request) {
    if (!file) throw new Error('No file uploaded');
    
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({ 
      cloud_name: 'qdq7ult5', 
      api_key: '677224231391214', 
      api_secret: 'xxxeSIdBn8CVDZ_bZvq2PfYCo8Q' 
    });
    try {
      const ext = extname(file.originalname).toLowerCase();
      const uploadOptions: any = {
        folder: 'kalvix_nexus/uploads',
        resource_type: 'auto'
      };
      
      // Auto convert images (tiff, png, bmp, etc.) to small jpg format
      if (['.tif', '.tiff', '.bmp', '.png', '.jpeg', '.jpg', '.webp'].includes(ext)) {
        uploadOptions.format = 'jpg';
      }

      const result = await cloudinary.uploader.upload(file.path, uploadOptions);
      // Optionally remove local file
      fs.unlinkSync(file.path);
      return { url: result.secure_url, filename: file.originalname, size: result.bytes || file.size, mimetype: uploadOptions.format ? 'image/jpeg' : file.mimetype };
    } catch (err) {
      console.error('Cloudinary upload failed:', err);
      // Fallback to local URL if Cloudinary fails
      const host = req.get('host');
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      return { url: `${protocol}://${host}/uploads/${file.filename}`, filename: file.filename, size: file.size, mimetype: file.mimetype };
    }
  }

  @Get('storage')
  async getStorageFiles(@Req() req: Request) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      return [];
    }
    const files = fs.readdirSync(dir);
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    
    return files.map(filename => {
      const stats = fs.statSync(`${dir}/${filename}`);
      return {
        filename,
        url: `${protocol}://${host}/uploads/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime,
      };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  @Delete('storage/:filename')
  async deleteStorageFile(@Param('filename') filename: string) {
    const filePath = `./uploads/${filename}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false, message: 'File not found' };
  }

  @Get('layout/*')
  async getLayout(@Param('0') pageId: string, @Req() req: Request) {
    const tenantId = (req as any).tenantId;
    return this.cmsService.getLayout(pageId, tenantId);
  }

  @Post('layout/*')
  async saveLayout(@Param('0') pageId: string, @Body() config: any, @Req() req: Request) {
    const tenantId = (req as any).tenantId;
    return this.cmsService.saveLayout(pageId, config, tenantId);
  }

  @Get('homepage')
  async getHomepage() {
    return this.cmsService.getHomepageCMS();
  }

  @Get('blogs')
  async getBlogs() {
    return this.cmsService.getBlogs();
  }

  @Get('blogs/:slug')
  async getBlog(@Param('slug') slug: string) {
    return this.cmsService.getBlogBySlug(slug);
  }

  @Get('faqs')
  async getFaqs() {
    return this.cmsService.getGlobalFAQs();
  }

  @Get('run-cleanup-and-optimize')
  async runCleanupAndOptimize() {
    return this.cmsService.runCleanupAndOptimize();
  }
}
