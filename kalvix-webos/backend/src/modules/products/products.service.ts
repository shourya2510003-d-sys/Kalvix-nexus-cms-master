import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // List products with advanced filtering and pagination
  async findAll(tenantId: string, query: {
    category?: string;
    collection?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const skip = (page - 1) * limit;

    const where: any = { status: 'ACTIVE' };
    if (tenantId) where.tenantId = tenantId;

    // Filter by category slug
    if (query.category) {
      where.categories = {
        some: { slug: query.category },
      };
    }

    // Filter by collection slug
    if (query.collection) {
      where.collections = {
        some: { slug: query.collection },
      };
    }

    // Search query
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Price range
    if (query.minPrice || query.maxPrice) {
      where.basePrice = {};
      if (query.minPrice) where.basePrice.gte = Number(query.minPrice);
      if (query.maxPrice) where.basePrice.lte = Number(query.maxPrice);
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (query.sortBy) {
      const [field, order] = query.sortBy.split(':');
      if (field === 'price') {
        orderBy = { basePrice: order };
      } else if (field === 'rating') {
        orderBy = { rating: order };
      } else if (field === 'name') {
        orderBy = { name: order };
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: { orderBy: { position: 'asc' } },
          variants: true,
          categories: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Find product by slug or sku
  async findOneBySlug(tenantId: string, slug: string) {
    let product = await this.prisma.product.findFirst({
      where: tenantId ? { slug, tenantId } : { slug },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
        categories: true,
        collections: true,
        faqs: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!product) {
      const variantWhere: any = { variants: { some: { sku: slug } } };
      if (tenantId) variantWhere.tenantId = tenantId;

      product = await this.prisma.product.findFirst({
        where: variantWhere,
        include: {
          images: { orderBy: { position: 'asc' } },
          variants: true,
          categories: true,
          collections: true,
          faqs: true,
          reviews: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      });
    }

    if (!product) {
      throw new NotFoundException(`Product with slug or SKU ${slug} not found`);
    }

    return product;
  }

  // Add review
  async addReview(userId: string, productId: string, rating: number, comment: string, title?: string) {
    const review = await this.prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
        title,
        isApproved: true, // Auto-approve for testing
      },
    });

    // Update Product average rating
    const aggregate = await this.prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
    });

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: aggregate._avg.rating || rating,
      },
    });

    return review;
  }

  // Fetch categories
  async getCategories(tenantId: string) {
    return this.prisma.category.findMany({
      where: tenantId ? { tenantId } : {},
      include: {
        subCategories: true,
      },
    });
  }

  // Fetch collections
  async getCollections(tenantId: string) {
    return this.prisma.collection.findMany({
      where: tenantId ? { isActive: true, tenantId } : { isActive: true },
    });
  }

  // Related products / Cross-sell
  async getRelatedProducts(tenantId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { categories: true },
    });

    if (!product || product.categories.length === 0) {
      const pWhere: any = { id: { not: productId }, status: 'ACTIVE' };
      if (tenantId) pWhere.tenantId = tenantId;
      return this.prisma.product.findMany({
        where: pWhere,
        take: 4,
        include: { images: true, variants: true },
      });
    }

    const categoryIds = product.categories.map((c) => c.id);

    const relWhere: any = {
      id: { not: productId },
      status: 'ACTIVE',
      categories: {
        some: { id: { in: categoryIds } },
      },
    };
    if (tenantId) relWhere.tenantId = tenantId;

    return this.prisma.product.findMany({
      where: relWhere,
      take: 4,
      include: {
        images: true,
        variants: true,
      },
    });
  }
}
