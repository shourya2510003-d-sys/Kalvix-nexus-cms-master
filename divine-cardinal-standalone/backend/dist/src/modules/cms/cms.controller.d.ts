import { Request } from 'express';
import { CmsService } from './cms.service';
export declare class CmsController {
    private cmsService;
    constructor(cmsService: CmsService);
    uploadFile(file: any, req: Request): Promise<{
        url: any;
        filename: any;
        size: any;
        mimetype: any;
    }>;
    getStorageFiles(req: Request): Promise<{
        filename: string;
        url: string;
        size: number;
        createdAt: Date;
    }[]>;
    deleteStorageFile(filename: string): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    getLayout(pageId: string, req: Request): Promise<import("@prisma/client/runtime/library").JsonValue>;
    saveLayout(pageId: string, config: any, req: Request): Promise<{
        id: string;
        updatedAt: Date;
        pageId: string;
        config: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getHomepage(): Promise<{
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
    getBlog(slug: string): Promise<{
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
    getFaqs(): Promise<{
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
