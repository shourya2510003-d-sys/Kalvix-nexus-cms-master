import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  // List blogs
  async getBlogs() {
    return this.prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get blog detail
  async getBlogBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
    });
    if (!post) {
      throw new NotFoundException(`Blog post not found`);
    }
    return post;
  }

  // Save layout for a specific page (e.g. homepage, shop)
  async saveLayout(pageId: string, config: any, tenantId?: string) {
    const scopedPageId = tenantId ? `${tenantId}:${pageId}` : pageId;
    return this.prisma.cmsLayout.upsert({
      where: { pageId: scopedPageId },
      update: { config },
      create: { pageId: scopedPageId, config },
    });
  }

  // Get layout config for a page
  async getLayout(pageId: string, tenantId?: string) {
    const scopedPageId = tenantId ? `${tenantId}:${pageId}` : pageId;
    // Try tenant-scoped layout first
    let layout = await this.prisma.cmsLayout.findUnique({
      where: { pageId: scopedPageId },
    });
    // If not found and tenantId provided, fallback to global layout
    if (!layout && tenantId) {
      layout = await this.prisma.cmsLayout.findUnique({
        where: { pageId },
      });
    }
    return layout ? layout.config : null;
  }

  // Get homepage layout elements
  async getHomepageCMS() {
    const banners = await this.prisma.banner.findMany({
      where: { isActive: true },
    });

    const bestSellers = await this.prisma.product.findMany({
      where: {
        collections: { some: { slug: 'best-sellers' } },
        status: 'ACTIVE',
      },
      include: { images: true, variants: true },
      take: 4,
    });

    return {
      banners,
      bestSellers,
    };
  }

  // Get FAQs
  async getGlobalFAQs() {
    return [
      {
        question: 'Are all your products 100% natural?',
        answer: 'Yes! All Kalvix Nexus and Divine Cardinal formulations are 100% plant-based, cruelty-free, paraben-free, and crafted using pure Ayurvedic essential oils and ingredients.',
      },
      {
        question: 'How do you ensure shipping safety?',
        answer: 'We package all our therapeutic oils in high-quality dark glass bottles to prevent UV damage, wrapped inside eco-friendly biodegradable cardboard tubes for shipping protection.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes! We ship across India through Shiprocket and provide secure international shipping to selected destinations worldwide.',
      },
    ];
  }

  async runCleanupAndOptimize() {
    console.log('--- Triggering Web-based Database Cleanup and Optimization ---');
    let duplicateDeletedCount = 0;
    
    try {
      // 1. Deduplicate reviews
      const allReviews = await this.prisma.review.findMany({
        orderBy: { createdAt: 'asc' }
      });

      const uniqueMap = new Map();
      const toDeleteIds = [];

      for (const review of allReviews) {
        const key = `${review.productId}-${review.userId}-${review.comment.trim().toLowerCase()}`;
        if (uniqueMap.has(key)) {
          toDeleteIds.push(review.id);
        } else {
          uniqueMap.set(key, review.id);
        }
      }

      if (toDeleteIds.length > 0) {
        const deleteResult = await this.prisma.review.deleteMany({
          where: { id: { in: toDeleteIds } }
        });
        duplicateDeletedCount = deleteResult.count;
      }

      // Re-aggregate ratings
      const allProductsForRating = await this.prisma.product.findMany();
      for (const p of allProductsForRating) {
        const aggregate = await this.prisma.review.aggregate({
          where: { productId: p.id, isApproved: true },
          _avg: { rating: true },
        });
        if (aggregate._avg.rating !== null) {
          await this.prisma.product.update({
            where: { id: p.id },
            data: { rating: aggregate._avg.rating }
          });
        }
      }

      // 2. Format howToUse and add FAQs
      const products = await this.prisma.product.findMany();
      for (const product of products) {
        // Format howToUse to bullet points
        let optimizedHowToUse = product.howToUse;
        if (optimizedHowToUse && !optimizedHowToUse.includes('<ul>')) {
          const sentences = optimizedHowToUse.split(/[.\n]+/).map(s => s.trim()).filter(s => s.length > 4);
          if (sentences.length > 0) {
            optimizedHowToUse = `<ul>${sentences.map(s => `<li>${s.replace(/^\d+\.\s*/, '')}.</li>`).join('')}</ul>`;
          }
        } else if (!optimizedHowToUse) {
          optimizedHowToUse = `<ul><li>Gently apply a small amount as needed.</li><li>For best results, use consistently as part of your daily routine.</li></ul>`;
        }

        // Generate tailored FAQs
        const pName = product.name;
        const pSlug = (product.slug || '').toLowerCase();
        let faqs = [
          {
            question: `What are the key benefits of ${pName}?`,
            answer: `Our ${pName} is formulated with premium Ayurvedic ingredients to nurture, soothe, and support wellness. Daily use targets specific concerns while supporting holistic energy.`
          },
          {
            question: `Is ${pName} safe for regular use?`,
            answer: `Yes, it is 100% natural, chemical-free, and safe for regular topical use. We recommend doing a patch test before first use.`
          }
        ];

        // Custom FAQs based on category
        if (pSlug.includes('women') || pName.toLowerCase().includes('women')) {
          faqs.push({
            question: `Can I use ${pName} during pregnancy or menstruation?`,
            answer: `While our ingredients are natural, we always advise pregnant or nursing mothers to consult their healthcare provider before introducing new therapeutic oils.`
          });
        } else if (pSlug.includes('men') || pName.toLowerCase().includes('men')) {
          faqs.push({
            question: `Will ${pName} leave a greasy residue?`,
            answer: `No, this premium blend is designed for quick absorption, leaving your skin soft and nourished without a heavy or greasy feel.`
          });
        } else if (pSlug.includes('attar') || pSlug.includes('rose') || pName.toLowerCase().includes('attar') || pName.toLowerCase().includes('rose')) {
          faqs = [
            {
              question: `Is ${pName} alcohol-free?`,
              answer: `Yes! Our attars are 100% alcohol-free and oil-based, crafted using traditional Kannauj steam-distillation methods for a long-lasting, luxury fragrance.`
            },
            {
              question: `How should I apply ${pName}?`,
              answer: `Apply a few drops using the glass applicator onto pulse points—your wrists, neck, and behind the ears. Rub gently to release the fragrance.`
            }
          ];
        } else if (pSlug.includes('baby') || pSlug.includes('teething') || pName.toLowerCase().includes('baby') || pName.toLowerCase().includes('teething')) {
          faqs = [
            {
              question: `Is ${pName} safe for newborns?`,
              answer: `Yes, it is formulated with gentle, highly diluted baby-safe botanical extracts. However, always perform a patch test on a small area of the baby's leg first.`
            },
            {
              question: `Can this be ingested or applied inside the mouth?`,
              answer: `No, our baby care range is strictly for external topical use. For example, teething oils must be massaged along the jawline externally.`
            }
          ];
        }

        // Update database
        await this.prisma.product.update({
          where: { id: product.id },
          data: { howToUse: optimizedHowToUse }
        });

        await this.prisma.productFAQ.deleteMany({
          where: { productId: product.id }
        });

        await this.prisma.productFAQ.createMany({
          data: faqs.map(f => ({
            productId: product.id,
            question: f.question,
            answer: f.answer
          }))
        });
      }

      return {
        success: true,
        message: 'Deduplicated reviews and updated all product FAQs + instructions successfully!',
        duplicateReviewsDeleted: duplicateDeletedCount,
        productsOptimizedCount: products.length
      };

    } catch (err) {
      console.error('Error during runCleanupAndOptimize:', err);
      return {
        success: false,
        error: err.message || err
      };
    }
  }
}
