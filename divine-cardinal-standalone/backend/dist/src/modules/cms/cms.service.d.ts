import { PrismaService } from '../../prisma/prisma.service';
export declare class CmsService {
    private prisma;
    constructor(prisma: PrismaService);
    getBlogs(): Promise<{
        id: string;
        slug: string;
        summary: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        image: string | null;
        title: string;
        content: string;
        author: string;
        tags: string[];
        isPublished: boolean;
    }[]>;
    getBlogBySlug(slug: string): Promise<{
        id: string;
        slug: string;
        summary: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        image: string | null;
        title: string;
        content: string;
        author: string;
        tags: string[];
        isPublished: boolean;
    }>;
    saveLayout(pageId: string, config: any, tenantId?: string): Promise<{
        id: string;
        updatedAt: Date;
        pageId: string;
        config: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getLayout(pageId: string, tenantId?: string): Promise<import("@prisma/client/runtime/library").JsonValue>;
    getHomepageCMS(): Promise<{
        banners: {
            id: string;
            createdAt: Date;
            tenantId: string | null;
            image: string;
            isActive: boolean;
            title: string;
            position: string;
            subtitle: string | null;
            link: string | null;
        }[];
        bestSellers: ({
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
    }>;
    getGlobalFAQs(): Promise<{
        question: string;
        answer: string;
    }[]>;
    runCleanupAndOptimize(): Promise<{
        success: boolean;
        message: string;
        duplicateReviewsDeleted: number;
        productsOptimizedCount: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        duplicateReviewsDeleted?: undefined;
        productsOptimizedCount?: undefined;
    }>;
}
