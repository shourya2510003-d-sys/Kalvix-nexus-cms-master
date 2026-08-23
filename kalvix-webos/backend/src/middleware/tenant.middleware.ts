import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantSlugHeader = req.headers['x-tenant-slug'];
    let slug = '';

    if (tenantSlugHeader && typeof tenantSlugHeader === 'string') {
      slug = tenantSlugHeader;
    } else {
      // Fallback: extract from Host header
      const host = req.headers.host || '';
      const hostname = host.split(':')[0];
      
      // e.g. "store1.kalvixnexus.com"
      const parts = hostname.split('.');
      if (parts.length >= 3 && hostname.includes('kalvixnexus.com')) {
        slug = parts[0];
      } else {
        // Custom domain or default
        if (hostname === 'localhost' || hostname === 'divinecardinal.com' || hostname === 'api') {
           slug = 'divine-cardinal';
        } else if (parts.length >= 2) {
           // Might be a custom domain like mystore.com
           // We will leave slug empty and lookup by hostname
        }
      }
    }

    let tenant = null;

    if (slug) {
      // 1. Try finding by slug first (for subdomains)
      tenant = await this.prisma.tenant.findFirst({
        where: { slug }
      });
    }

    // 2. If not found by slug (or slug is empty), try finding by custom domain
    if (!tenant && req.headers.host) {
      tenant = await this.prisma.tenant.findFirst({
        where: { domain: req.headers.host.split(':')[0] }
      });
    }

    if (tenant) {
      (req as any).tenantId = tenant.id;
      (req as any).tenantSlug = tenant.slug;
    }

    next();
  }
}
