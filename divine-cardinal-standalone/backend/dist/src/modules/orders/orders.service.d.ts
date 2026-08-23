import { PrismaService } from '../../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    getCart(userId: string): Promise<({
        variant: {
            product: {
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
            };
        } & {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        variantId: string;
        quantity: number;
    })[]>;
    syncCart(userId: string, items: {
        variantId: string;
        quantity: number;
    }[]): Promise<({
        variant: {
            product: {
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
            };
        } & {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        variantId: string;
        quantity: number;
    })[]>;
    validateCoupon(code: string, orderAmount: number, tenantId?: string): Promise<{
        valid: boolean;
        discountAmount: number;
        code: string;
    }>;
    calculateShipping(postalCode: string, orderWeight: number): Promise<{
        shippingCost: number;
        estimatedDelivery: Date;
        serviceable: boolean;
    }>;
    createOrder(userId: string, data: {
        shippingAddressId: string;
        billingAddressId: string;
        couponCode?: string;
        paymentMethod: PaymentMethod;
        notes?: string;
    }, tenantId?: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        userId: string;
        orderNumber: string;
        shippingAddressId: string;
        billingAddressId: string;
        shippingMethod: string | null;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        couponCode: string | null;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        notes: string | null;
        estimatedDelivery: Date | null;
    }>;
    getUserOrders(userId: string, tenantId?: string): Promise<({
        items: {
            id: string;
            name: string;
            createdAt: Date;
            sku: string;
            price: import("@prisma/client/runtime/library").Decimal;
            variantId: string;
            quantity: number;
            orderId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        userId: string;
        orderNumber: string;
        shippingAddressId: string;
        billingAddressId: string;
        shippingMethod: string | null;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        couponCode: string | null;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        notes: string | null;
        estimatedDelivery: Date | null;
    })[]>;
    getOrderDetails(orderId: string, userId?: string): Promise<{
        user: {
            email: string;
            phone: string;
            firstName: string;
            lastName: string;
        };
        items: {
            id: string;
            name: string;
            createdAt: Date;
            sku: string;
            price: import("@prisma/client/runtime/library").Decimal;
            variantId: string;
            quantity: number;
            orderId: string;
        }[];
        history: {
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            comment: string | null;
            orderId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string | null;
        userId: string;
        orderNumber: string;
        shippingAddressId: string;
        billingAddressId: string;
        shippingMethod: string | null;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        couponCode: string | null;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        notes: string | null;
        estimatedDelivery: Date | null;
    }>;
    generateInvoicePdf(orderId: string): Promise<Buffer>;
}
