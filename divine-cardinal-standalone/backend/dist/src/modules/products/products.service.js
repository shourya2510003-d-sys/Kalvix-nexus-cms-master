"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId, query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 12;
        const skip = (page - 1) * limit;
        const where = { status: 'ACTIVE' };
        if (tenantId)
            where.tenantId = tenantId;
        if (query.category) {
            where.categories = {
                some: { slug: query.category },
            };
        }
        if (query.collection) {
            where.collections = {
                some: { slug: query.collection },
            };
        }
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { summary: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.minPrice || query.maxPrice) {
            where.basePrice = {};
            if (query.minPrice)
                where.basePrice.gte = Number(query.minPrice);
            if (query.maxPrice)
                where.basePrice.lte = Number(query.maxPrice);
        }
        let orderBy = { createdAt: 'desc' };
        if (query.sortBy) {
            const [field, order] = query.sortBy.split(':');
            if (field === 'price') {
                orderBy = { basePrice: order };
            }
            else if (field === 'rating') {
                orderBy = { rating: order };
            }
            else if (field === 'name') {
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
    async findOneBySlug(tenantId, slug) {
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
            const variantWhere = { variants: { some: { sku: slug } } };
            if (tenantId)
                variantWhere.tenantId = tenantId;
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
            throw new common_1.NotFoundException(`Product with slug or SKU ${slug} not found`);
        }
        return product;
    }
    async addReview(userId, productId, rating, comment, title) {
        const review = await this.prisma.review.create({
            data: {
                userId,
                productId,
                rating,
                comment,
                title,
                isApproved: true,
            },
        });
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
    async getCategories(tenantId) {
        return this.prisma.category.findMany({
            where: tenantId ? { tenantId } : {},
            include: {
                subCategories: true,
            },
        });
    }
    async getCollections(tenantId) {
        return this.prisma.collection.findMany({
            where: tenantId ? { isActive: true, tenantId } : { isActive: true },
        });
    }
    async getRelatedProducts(tenantId, productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { categories: true },
        });
        if (!product || product.categories.length === 0) {
            const pWhere = { id: { not: productId }, status: 'ACTIVE' };
            if (tenantId)
                pWhere.tenantId = tenantId;
            return this.prisma.product.findMany({
                where: pWhere,
                take: 4,
                include: { images: true, variants: true },
            });
        }
        const categoryIds = product.categories.map((c) => c.id);
        const relWhere = {
            id: { not: productId },
            status: 'ACTIVE',
            categories: {
                some: { id: { in: categoryIds } },
            },
        };
        if (tenantId)
            relWhere.tenantId = tenantId;
        return this.prisma.product.findMany({
            where: relWhere,
            take: 4,
            include: {
                images: true,
                variants: true,
            },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map