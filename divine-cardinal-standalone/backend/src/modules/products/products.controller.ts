import { Controller, Get, Post, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async getProducts(
    @Request() req,
    @Query('category') category?: string,
    @Query('collection') collection?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.findAll((req as any).tenantId, {
      category,
      collection,
      search,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
    });
  }

  @Get('categories')
  async getCategories(@Request() req) {
    return this.productsService.getCategories((req as any).tenantId);
  }

  @Get('collections')
  async getCollections(@Request() req) {
    return this.productsService.getCollections((req as any).tenantId);
  }

  @Get(':slug')
  async getProduct(@Request() req, @Param('slug') slug: string) {
    return this.productsService.findOneBySlug((req as any).tenantId, slug);
  }

  @Get(':id/related')
  async getRelated(@Request() req, @Param('id') id: string) {
    return this.productsService.getRelatedProducts((req as any).tenantId, id);
  }

  @Post(':id/reviews')
  @UseGuards(AuthGuard('jwt'))
  async addReview(
    @Param('id') productId: string,
    @Request() req,
    @Body('rating') rating: number,
    @Body('comment') comment: string,
    @Body('title') title?: string,
  ) {
    return this.productsService.addReview(req.user.id, productId, rating, comment, title);
  }
}
