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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminController = class AdminController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProducts(req) {
        const tenantId = req.tenantId;
        const products = await this.prisma.product.findMany({
            where: tenantId ? { tenantId } : {},
            include: { images: true, variants: true, categories: true }
        });
        return products.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            status: p.status === 'ACTIVE' ? 'Active' : 'Draft',
            inventory: p.variants.reduce((acc, v) => acc + (v.inventoryQuantity || 0), 0),
            sku: p.variants.length > 0 ? p.variants[0].sku : '',
            barcode: p.variants.length > 0 ? p.variants[0].barcode : '',
            category: p.categories.length > 0 ? p.categories[0].name : 'Uncategorized',
            type: 'Physical',
            vendor: 'Divine Cardinal',
            price: Number(p.basePrice),
            image: p.images?.length > 0 ? p.images[0].url : '',
            tags: p.tags || '',
            summary: p.summary || '',
            keyIngredients: p.keyIngredients || '',
            howToUse: p.howToUse || '',
            overview: p.overview || '',
            focusKeyword: p.focusKeyword || '',
            secondaryKeywords: p.secondaryKeywords ? JSON.parse(p.secondaryKeywords) : [],
            seoTags: p.seoTags || '',
            externalRefs: p.externalRefs ? JSON.parse(p.externalRefs) : [],
            whoIsItFor: p.whoIsItFor || '',
            keyBenefitsText: p.keyBenefitsText || '',
            imageAltText: p.imageAltText || '',
            internalLinksText: p.internalLinksText ? JSON.parse(p.internalLinksText) : []
        }));
    }
    async createProduct(data, req) {
        const tenantId = req.tenantId;
        const createData = {
            id: data.id || undefined,
            name: data.name || 'Unnamed Product',
            slug: (data.name || 'unnamed-product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            description: data.description || '',
            basePrice: data.price || 0,
            status: data.status === 'Active' ? 'ACTIVE' : 'DRAFT',
            tenantId: tenantId || undefined,
            summary: data.summary,
            keyIngredients: data.keyIngredients,
            howToUse: data.howToUse,
            overview: data.overview,
            focusKeyword: data.focusKeyword,
            secondaryKeywords: Array.isArray(data.secondaryKeywords) ? JSON.stringify(data.secondaryKeywords) : data.secondaryKeywords,
            seoTags: data.seoTags,
            externalRefs: Array.isArray(data.externalRefs) ? JSON.stringify(data.externalRefs) : data.externalRefs,
            whoIsItFor: data.whoIsItFor,
            keyBenefitsText: data.keyBenefitsText,
            imageAltText: data.imageAltText,
            internalLinksText: Array.isArray(data.internalLinksText) ? JSON.stringify(data.internalLinksText) : data.internalLinksText
        };
        return this.prisma.product.create({ data: createData });
    }
    async fixSkuCategories() {
        const products = await this.prisma.product.findMany({
            include: { variants: true }
        });
        let updatedCount = 0;
        for (const p of products) {
            if (p.variants && p.variants.length > 0) {
                const sku = p.variants[0].sku || '';
                let catSlug = '';
                let catName = '';
                if (sku.startsWith('DCIWN')) {
                    catSlug = 'wellness-category';
                    catName = 'Wellness Category';
                }
                else if (sku.startsWith('DCIW')) {
                    catSlug = 'womens-care';
                    catName = "Women's Care";
                }
                else if (sku.startsWith('DCIFB')) {
                    catSlug = 'face-and-body';
                    catName = 'Face and Body';
                }
                else if (sku.startsWith('DCIMC')) {
                    catSlug = 'mother-care';
                    catName = 'MOTHER Care';
                }
                else if (sku.startsWith('DCIM')) {
                    catSlug = 'men-care';
                    catName = 'Men Care';
                }
                if (catSlug) {
                    await this.prisma.product.update({
                        where: { id: p.id },
                        data: {
                            categories: {
                                set: [],
                                connectOrCreate: {
                                    where: { slug: catSlug },
                                    create: { name: catName, slug: catSlug }
                                }
                            }
                        }
                    });
                    updatedCount++;
                }
            }
        }
        return { success: true, message: `Fixed categories for ${updatedCount} products based on SKU.` };
    }
    async bulkUpdateImages(payload) {
        let count = 0;
        for (const item of payload) {
            const variant = await this.prisma.productVariant.findUnique({
                where: { sku: item.sku }
            });
            if (variant) {
                await this.prisma.productImage.deleteMany({
                    where: { productId: variant.productId }
                });
                if (item.urls.length > 0) {
                    await this.prisma.productImage.createMany({
                        data: item.urls.map((url, i) => ({
                            productId: variant.productId,
                            url,
                            position: i,
                            altText: item.sku
                        }))
                    });
                }
                count++;
            }
        }
        return { success: true, updated: count };
    }
    async fixSlugs() {
        const products = await this.prisma.product.findMany();
        let count = 0;
        for (const p of products) {
            const cleanSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            if (p.slug !== cleanSlug) {
                try {
                    await this.prisma.product.update({
                        where: { id: p.id },
                        data: { slug: cleanSlug }
                    });
                    count++;
                }
                catch (e) {
                }
            }
        }
        return { success: true, updated: count };
    }
    async bulkUpdateFromExcel(products) {
        let successCount = 0;
        for (const product of products) {
            let keyIngredients = '';
            const ingredients = [];
            if (product.essentialOils?.length > 0) {
                ingredients.push(`Essential Oils: ${product.essentialOils.join(', ')}`);
            }
            if (product.carrierOils?.length > 0) {
                ingredients.push(`Carrier Oils: ${product.carrierOils.join(', ')}`);
            }
            if (ingredients.length > 0) {
                keyIngredients = ingredients.join(' | ');
            }
            const howToUse = product.directions?.length > 0 ? product.directions.join('\n') : '';
            const possibleSkus = [product.sku, `VAR-${product.sku}`];
            let variant = null;
            for (const s of possibleSkus) {
                variant = await this.prisma.productVariant.findUnique({
                    where: { sku: s }
                });
                if (variant)
                    break;
            }
            if (variant) {
                await this.prisma.productVariant.update({
                    where: { id: variant.id },
                    data: { price: product.price }
                });
                const updateData = { basePrice: product.price };
                if (keyIngredients)
                    updateData.keyIngredients = keyIngredients;
                if (howToUse)
                    updateData.howToUse = howToUse;
                await this.prisma.product.update({
                    where: { id: variant.productId },
                    data: updateData
                });
                successCount++;
            }
        }
        return { success: true, updated: successCount };
    }
    async bulkCreateProducts(data, req) {
        const tenantId = req.tenantId;
        let count = 0;
        for (const key of Object.keys(data)) {
            const p = data[key];
            const slugBase = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const upsertData = {
                name: p.name,
                description: p.description || '',
                basePrice: p.basePrice || p.price || 0,
                slug: `${slugBase}-${Math.floor(Math.random() * 10000)}`,
                status: p.status === 'Active' ? 'ACTIVE' : 'DRAFT',
            };
            if (tenantId)
                upsertData.tenantId = tenantId;
            await this.prisma.product.upsert({
                where: { id: p.id },
                update: upsertData,
                create: {
                    id: p.id,
                    ...upsertData,
                    categories: {
                        connectOrCreate: {
                            where: { slug: (p.category || 'uncategorized').toLowerCase().replace(/[^a-z0-9]+/g, '-') },
                            create: { name: p.category || 'Uncategorized', slug: (p.category || 'uncategorized').toLowerCase().replace(/[^a-z0-9]+/g, '-') }
                        }
                    },
                    images: p.images?.length > 0 ? {
                        create: p.images.map((img) => ({ url: typeof img === 'string' ? img : (img.url || ''), altText: p.name }))
                    } : (p.image ? {
                        create: [{ url: p.image, altText: p.name }]
                    } : undefined),
                    variants: p.variants?.length > 0 ? {
                        create: p.variants.map((v) => ({
                            sku: v.sku || v.id,
                            title: v.title || 'Standard',
                            price: v.price || p.basePrice,
                            inventoryQuantity: p.inventory || 0,
                        }))
                    } : undefined
                }
            });
            count++;
        }
        return { success: true, count };
    }
    async updateProduct(id, data, req) {
        const tenantId = req.tenantId;
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.price !== undefined)
            updateData.basePrice = data.price;
        if (data.status !== undefined)
            updateData.status = data.status === 'Active' ? 'ACTIVE' : 'DRAFT';
        if (data.summary !== undefined)
            updateData.summary = data.summary;
        if (data.keyIngredients !== undefined)
            updateData.keyIngredients = data.keyIngredients;
        if (data.howToUse !== undefined)
            updateData.howToUse = data.howToUse;
        if (data.overview !== undefined)
            updateData.overview = data.overview;
        if (data.focusKeyword !== undefined)
            updateData.focusKeyword = data.focusKeyword;
        if (data.secondaryKeywords !== undefined)
            updateData.secondaryKeywords = Array.isArray(data.secondaryKeywords) ? JSON.stringify(data.secondaryKeywords) : data.secondaryKeywords;
        if (data.seoTags !== undefined)
            updateData.seoTags = data.seoTags;
        if (data.externalRefs !== undefined)
            updateData.externalRefs = Array.isArray(data.externalRefs) ? JSON.stringify(data.externalRefs) : data.externalRefs;
        if (data.whoIsItFor !== undefined)
            updateData.whoIsItFor = data.whoIsItFor;
        if (data.keyBenefitsText !== undefined)
            updateData.keyBenefitsText = data.keyBenefitsText;
        if (data.imageAltText !== undefined)
            updateData.imageAltText = data.imageAltText;
        if (data.internalLinksText !== undefined)
            updateData.internalLinksText = Array.isArray(data.internalLinksText) ? JSON.stringify(data.internalLinksText) : data.internalLinksText;
        const product = await this.prisma.product.upsert({
            where: { id },
            update: updateData,
            create: {
                id,
                name: updateData.name || 'Unnamed Product',
                slug: (updateData.name || 'unnamed-product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                description: updateData.description || '',
                basePrice: updateData.basePrice || 0,
                status: updateData.status || 'DRAFT',
                tenantId: tenantId || undefined
            }
        });
        if (data.inventory !== undefined) {
            const existingVariants = await this.prisma.productVariant.findMany({ where: { productId: id } });
            if (existingVariants.length > 0) {
                await this.prisma.productVariant.update({
                    where: { id: existingVariants[0].id },
                    data: { inventoryQuantity: Number(data.inventory) }
                });
            }
            else {
                await this.prisma.productVariant.create({
                    data: {
                        productId: id,
                        sku: `VAR-${id}`,
                        title: 'Standard',
                        price: updateData.basePrice || 0,
                        inventoryQuantity: Number(data.inventory)
                    }
                });
            }
        }
        if (data.category) {
            const catSlug = data.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            await this.prisma.product.update({
                where: { id },
                data: {
                    categories: {
                        set: [],
                        connectOrCreate: {
                            where: { slug: catSlug },
                            create: { name: data.category, slug: catSlug }
                        }
                    }
                }
            });
        }
        if (data.images !== undefined && Array.isArray(data.images)) {
            await this.prisma.productImage.deleteMany({ where: { productId: id } });
            if (data.images.length > 0) {
                await this.prisma.productImage.createMany({
                    data: data.images.map((img, idx) => ({
                        productId: id,
                        url: typeof img === 'string' ? img : (img.url || ''),
                        altText: data.name || 'Product Image',
                        position: idx,
                    })),
                });
            }
        }
        else if (data.image !== undefined && typeof data.image === 'string') {
            await this.prisma.productImage.deleteMany({ where: { productId: id } });
            if (data.image.trim()) {
                await this.prisma.productImage.create({
                    data: {
                        productId: id,
                        url: data.image,
                        altText: data.name || 'Product Image',
                        position: 0,
                    }
                });
            }
        }
        return product;
    }
    async deleteProduct(id) {
        return this.prisma.product.delete({ where: { id } });
    }
    async getOrders(req) {
        const tenantId = req.tenantId;
        return this.prisma.order.findMany({
            where: tenantId ? { tenantId } : {},
            include: { user: true, items: true, payments: true }
        });
    }
    async updateOrder(id, data) {
        return this.prisma.order.update({ where: { id }, data });
    }
    async getMockOrders(req) {
        const tenantId = req.tenantId || 'default';
        const key = `MOCK_ORDERS_${tenantId}`;
        const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
        return setting ? JSON.parse(setting.value) : [];
    }
    async updateMockOrder(id, data, req) {
        const tenantId = req.tenantId || 'default';
        const key = `MOCK_ORDERS_${tenantId}`;
        const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
        let orders = setting ? JSON.parse(setting.value) : [];
        const idx = orders.findIndex((o) => o.id === id);
        if (idx >= 0) {
            orders[idx] = { ...orders[idx], ...data };
        }
        else {
            orders.push(data);
        }
        await this.prisma.systemSetting.upsert({
            where: { key },
            update: { value: JSON.stringify(orders) },
            create: { key, value: JSON.stringify(orders) }
        });
        return { success: true };
    }
    async deleteMockOrder(id, req) {
        const tenantId = req.tenantId || 'default';
        const key = `MOCK_ORDERS_${tenantId}`;
        const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
        let orders = setting ? JSON.parse(setting.value) : [];
        const idx = orders.findIndex((o) => o.id === id);
        if (idx >= 0) {
            orders.splice(idx, 1);
            await this.prisma.systemSetting.upsert({
                where: { key },
                update: { value: JSON.stringify(orders) },
                create: { key, value: JSON.stringify(orders) }
            });
        }
        return { success: true };
    }
    async getReviews(req) {
        const tenantId = req.tenantId;
        return this.prisma.review.findMany({
            where: tenantId ? { product: { tenantId } } : {},
            include: { user: true, product: true }
        });
    }
    async updateReview(id, data) {
        return this.prisma.review.update({ where: { id }, data });
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Get)('fix-sku-categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "fixSkuCategories", null);
__decorate([
    (0, common_1.Post)('products/bulk-images'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkUpdateImages", null);
__decorate([
    (0, common_1.Get)('fix-slugs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "fixSlugs", null);
__decorate([
    (0, common_1.Post)('products/bulk-update-excel'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkUpdateFromExcel", null);
__decorate([
    (0, common_1.Post)('products/bulk'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkCreateProducts", null);
__decorate([
    (0, common_1.Put)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Put)('orders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Get)('mock-orders'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getMockOrders", null);
__decorate([
    (0, common_1.Put)('mock-orders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateMockOrder", null);
__decorate([
    (0, common_1.Delete)('mock-orders/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteMockOrder", null);
__decorate([
    (0, common_1.Get)('reviews'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getReviews", null);
__decorate([
    (0, common_1.Put)('reviews/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateReview", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map