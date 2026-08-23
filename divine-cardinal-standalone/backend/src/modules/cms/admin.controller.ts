import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('admin')
// @UseGuards(AuthGuard('jwt')) // Optional: protect this in production
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('products')
  async getProducts(@Req() req: Request) {
    const tenantId = (req as any).tenantId;
    const products = await this.prisma.product.findMany({ 
      where: tenantId ? { tenantId } : {},
      include: { images: true, variants: true, categories: true } 
    });
    return products.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      status: p.status === 'ACTIVE' ? 'Active' : 'Draft',
      inventory: p.variants.reduce((acc: number, v: any) => acc + (v.inventoryQuantity || 0), 0),
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

  @Post('products')
  async createProduct(@Body() data: any, @Req() req: Request) {
    const tenantId = (req as any).tenantId;
    const createData: any = {
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

  @Get('fix-sku-categories')
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
          catSlug = 'wellness-category'; catName = 'Wellness Category';
        } else if (sku.startsWith('DCIW')) {
          catSlug = 'womens-care'; catName = "Women's Care";
        } else if (sku.startsWith('DCIFB')) {
          catSlug = 'face-and-body'; catName = 'Face and Body';
        } else if (sku.startsWith('DCIMC')) {
          catSlug = 'mother-care'; catName = 'MOTHER Care';
        } else if (sku.startsWith('DCIM')) {
          catSlug = 'men-care'; catName = 'Men Care';
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

  @Post('products/bulk-images')
  async bulkUpdateImages(@Body() payload: { sku: string, urls: string[] }[]) {
    let count = 0;
    for (const item of payload) {
      // Find the variant by SKU to get the productId
      const variant = await this.prisma.productVariant.findUnique({
        where: { sku: item.sku }
      });
      if (variant) {
        // Delete old images
        await this.prisma.productImage.deleteMany({
          where: { productId: variant.productId }
        });
        // Create new images
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

  @Get('fix-slugs')
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
        } catch (e) {
          // ignore unique constraint errors
        }
      }
    }
    return { success: true, updated: count };
  }

  @Post('products/bulk-update-excel')
  async bulkUpdateFromExcel(@Body() products: any[]) {
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
        if (variant) break;
      }
      
      if (variant) {
        await this.prisma.productVariant.update({
          where: { id: variant.id },
          data: { price: product.price }
        });
        
        const updateData: any = { basePrice: product.price };
        if (keyIngredients) updateData.keyIngredients = keyIngredients;
        if (howToUse) updateData.howToUse = howToUse;
        
        await this.prisma.product.update({
          where: { id: variant.productId },
          data: updateData
        });
        
        successCount++;
      }
    }
    return { success: true, updated: successCount };
  }

  @Post('products/bulk')
  async bulkCreateProducts(@Body() data: any, @Req() req: Request) {
    const tenantId = (req as any).tenantId;
    // data is a dictionary of products: { "id1": { ... }, "id2": { ... } }
    let count = 0;
    for (const key of Object.keys(data)) {
      const p = data[key];
      
      const slugBase = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const upsertData: any = {
        name: p.name,
        description: p.description || '',
        basePrice: p.basePrice || p.price || 0,
        slug: `${slugBase}-${Math.floor(Math.random() * 10000)}`,
        status: p.status === 'Active' ? 'ACTIVE' : 'DRAFT',
      };
      if (tenantId) upsertData.tenantId = tenantId;

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
            create: p.images.map((img: any) => ({ url: typeof img === 'string' ? img : (img.url || ''), altText: p.name }))
          } : (p.image ? {
            create: [{ url: p.image, altText: p.name }]
          } : undefined),
          variants: p.variants?.length > 0 ? {
            create: p.variants.map((v: any) => ({
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

  @Put('products/:id')
  async updateProduct(@Param('id') id: string, @Body() data: any, @Req() req: Request) {
    const tenantId = (req as any).tenantId;
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.basePrice = data.price;
    if (data.status !== undefined) updateData.status = data.status === 'Active' ? 'ACTIVE' : 'DRAFT';

    // Extended SEO & Content fields
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.keyIngredients !== undefined) updateData.keyIngredients = data.keyIngredients;
    if (data.howToUse !== undefined) updateData.howToUse = data.howToUse;
    if (data.overview !== undefined) updateData.overview = data.overview;
    if (data.focusKeyword !== undefined) updateData.focusKeyword = data.focusKeyword;
    if (data.secondaryKeywords !== undefined) updateData.secondaryKeywords = Array.isArray(data.secondaryKeywords) ? JSON.stringify(data.secondaryKeywords) : data.secondaryKeywords;
    if (data.seoTags !== undefined) updateData.seoTags = data.seoTags;
    if (data.externalRefs !== undefined) updateData.externalRefs = Array.isArray(data.externalRefs) ? JSON.stringify(data.externalRefs) : data.externalRefs;
    if (data.whoIsItFor !== undefined) updateData.whoIsItFor = data.whoIsItFor;
    if (data.keyBenefitsText !== undefined) updateData.keyBenefitsText = data.keyBenefitsText;
    if (data.imageAltText !== undefined) updateData.imageAltText = data.imageAltText;
    if (data.internalLinksText !== undefined) updateData.internalLinksText = Array.isArray(data.internalLinksText) ? JSON.stringify(data.internalLinksText) : data.internalLinksText;

    // Update basic fields
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
    
    // Update inventory via variant
    if (data.inventory !== undefined) {
      const existingVariants = await this.prisma.productVariant.findMany({ where: { productId: id } });
      if (existingVariants.length > 0) {
        await this.prisma.productVariant.update({
          where: { id: existingVariants[0].id },
          data: { inventoryQuantity: Number(data.inventory) }
        });
      } else {
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
    
    // Optionally handle category if provided
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

    // Update images if provided
    if (data.images !== undefined && Array.isArray(data.images)) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
      if (data.images.length > 0) {
        await this.prisma.productImage.createMany({
          data: data.images.map((img: any, idx: number) => ({
            productId: id,
            url: typeof img === 'string' ? img : (img.url || ''),
            altText: data.name || 'Product Image',
            position: idx,
          })),
        });
      }
    } else if (data.image !== undefined && typeof data.image === 'string') {
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

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.prisma.product.delete({ where: { id } }); // tenant scope checked if needed
  }

  @Get('orders')
  async getOrders(@Req() req: Request) {
    const tenantId = (req as any).tenantId;
    return this.prisma.order.findMany({ 
      where: tenantId ? { tenantId } : {},
      include: { user: true, items: true, payments: true } 
    });
  }

  @Put('orders/:id')
  async updateOrder(@Param('id') id: string, @Body() data: any) {
    return this.prisma.order.update({ where: { id }, data });
  }

  @Get('mock-orders')
  async getMockOrders(@Req() req: Request) {
    const tenantId = (req as any).tenantId || 'default';
    const key = `MOCK_ORDERS_${tenantId}`;
    const setting = await this.prisma.systemSetting.findUnique({ where: { key }});
    return setting ? JSON.parse(setting.value) : [];
  }

  @Put('mock-orders/:id')
  async updateMockOrder(@Param('id') id: string, @Body() data: any, @Req() req: Request) {
    const tenantId = (req as any).tenantId || 'default';
    const key = `MOCK_ORDERS_${tenantId}`;
    const setting = await this.prisma.systemSetting.findUnique({ where: { key }});
    let orders: any[] = setting ? JSON.parse(setting.value) : [];
    const idx = orders.findIndex((o: any) => o.id === id);
    if (idx >= 0) {
       orders[idx] = { ...orders[idx], ...data };
    } else {
       orders.push(data);
    }
    await this.prisma.systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(orders) },
      create: { key, value: JSON.stringify(orders) }
    });
    return { success: true };
  }

  @Delete('mock-orders/:id')
  async deleteMockOrder(@Param('id') id: string, @Req() req: Request) {
    const tenantId = (req as any).tenantId || 'default';
    const key = `MOCK_ORDERS_${tenantId}`;
    const setting = await this.prisma.systemSetting.findUnique({ where: { key }});
    let orders: any[] = setting ? JSON.parse(setting.value) : [];
    const idx = orders.findIndex((o: any) => o.id === id);
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
  
  @Get('reviews')
  async getReviews(@Req() req: Request) {
    const tenantId = (req as any).tenantId;
    return this.prisma.review.findMany({
      where: tenantId ? { product: { tenantId } } : {},
      include: { user: true, product: true } 
    });
  }

  @Put('reviews/:id')
  async updateReview(@Param('id') id: string, @Body() data: any) {
    return this.prisma.review.update({ where: { id }, data });
  }
}
