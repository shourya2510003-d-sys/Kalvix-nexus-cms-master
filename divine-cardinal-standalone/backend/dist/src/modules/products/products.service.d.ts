import { PrismaService } from '../../prisma/prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, query: {
        category?: string;
        collection?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        products: ({
            categories: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string | null;
                parentId: string | null;
            }[];
            variants: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string;
                title: string;
                price: import("@prisma/client/runtime/library").Decimal;
                compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                inventoryQuantity: number;
                weight: number | null;
                productId: string;
            }[];
            images: {
                id: string;
                createdAt: Date;
                productId: string;
                url: string;
                altText: string | null;
                position: number;
            }[];
        } & {
            id: string;
            name: string;
            slug: string;
            description: string;
            summary: string | null;
            keyIngredients: string | null;
            howToUse: string | null;
            status: string;
            rating: number;
            basePrice: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
            updatedAt: Date;
            overview: string | null;
            focusKeyword: string | null;
            secondaryKeywords: string | null;
            seoTags: string | null;
            externalRefs: string | null;
            whoIsItFor: string | null;
            keyBenefitsText: string | null;
            imageAltText: string | null;
            internalLinksText: string | null;
            tenantId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneBySlug(tenantId: string, slug: string): Promise<{
        categories: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            parentId: string | null;
        }[];
        collections: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            image: string | null;
            isActive: boolean;
        }[];
        variants: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            title: string;
            price: import("@prisma/client/runtime/library").Decimal;
            compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
            inventoryQuantity: number;
            weight: number | null;
            productId: string;
        }[];
        images: {
            id: string;
            createdAt: Date;
            productId: string;
            url: string;
            altText: string | null;
            position: number;
        }[];
        faqs: {
            id: string;
            createdAt: Date;
            productId: string;
            question: string;
            answer: string;
        }[];
        reviews: ({
            user: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            rating: number;
            createdAt: Date;
            updatedAt: Date;
            title: string | null;
            productId: string;
            userId: string;
            comment: string;
            isApproved: boolean;
        })[];
    } & {
        id: string;
        name: string;
        slug: string;
        description: string;
        summary: string | null;
        keyIngredients: string | null;
        howToUse: string | null;
        status: string;
        rating: number;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        overview: string | null;
        focusKeyword: string | null;
        secondaryKeywords: string | null;
        seoTags: string | null;
        externalRefs: string | null;
        whoIsItFor: string | null;
        keyBenefitsText: string | null;
        imageAltText: string | null;
        internalLinksText: string | null;
        tenantId: string | null;
    }>;
    addReview(userId: string, productId: string, rating: number, comment: string, title?: string): Promise<{
        id: string;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        productId: string;
        userId: string;
        comment: string;
        isApproved: boolean;
    }>;
    getCategories(tenantId: string): Promise<({
        subCategories: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string | null;
            parentId: string | null;
        }[];
    } & {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        parentId: string | null;
    })[]>;
    getCollections(tenantId: string): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        image: string | null;
        isActive: boolean;
    }[]>;
    getRelatedProducts(tenantId: string, productId: string): Promise<({
        variants: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            title: string;
            price: import("@prisma/client/runtime/library").Decimal;
            compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
            inventoryQuantity: number;
            weight: number | null;
            productId: string;
        }[];
        images: {
            id: string;
            createdAt: Date;
            productId: string;
            url: string;
            altText: string | null;
            position: number;
        }[];
    } & {
        id: string;
        name: string;
        slug: string;
        description: string;
        summary: string | null;
        keyIngredients: string | null;
        howToUse: string | null;
        status: string;
        rating: number;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        overview: string | null;
        focusKeyword: string | null;
        secondaryKeywords: string | null;
        seoTags: string | null;
        externalRefs: string | null;
        whoIsItFor: string | null;
        keyBenefitsText: string | null;
        imageAltText: string | null;
        internalLinksText: string | null;
        tenantId: string | null;
    })[]>;
}
