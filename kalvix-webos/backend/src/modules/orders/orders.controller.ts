import { Controller, Get, Post, Body, Param, UseGuards, Request, Res, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { PaymentMethod } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('cart')
  @UseGuards(AuthGuard('jwt'))
  async getCart(@Request() req) {
    return this.ordersService.getCart(req.user.id);
  }

  @Post('cart/sync')
  @UseGuards(AuthGuard('jwt'))
  async syncCart(@Request() req, @Body('items') items: { variantId: string; quantity: number }[]) {
    return this.ordersService.syncCart(req.user.id, items);
  }

  @Get('coupon/validate')
  async validateCoupon(@Request() req, @Query('code') code: string, @Query('amount') amount: number) {
    return this.ordersService.validateCoupon(code, amount, (req as any).tenantId);
  }

  @Get('shipping/serviceability')
  async checkShipping(@Query('pincode') pincode: string, @Query('weight') weight: number) {
    return this.ordersService.calculateShipping(pincode, weight);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createOrder(
    @Request() req,
    @Body('shippingAddressId') shippingAddressId: string,
    @Body('billingAddressId') billingAddressId: string,
    @Body('couponCode') couponCode?: string,
    @Body('paymentMethod') paymentMethod?: PaymentMethod,
    @Body('notes') notes?: string,
  ) {
    return this.ordersService.createOrder(
      req.user.id,
      {
        shippingAddressId,
        billingAddressId,
        couponCode,
        paymentMethod: paymentMethod || PaymentMethod.COD,
        notes,
      },
      (req as any).tenantId,
    );
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  async getHistory(@Request() req) {
    return this.ordersService.getUserOrders(req.user.id, (req as any).tenantId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getDetails(@Param('id') id: string, @Request() req) {
    return this.ordersService.getOrderDetails(id, req.user.id);
  }

  @Get(':id/invoice')
  @UseGuards(AuthGuard('jwt'))
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.ordersService.generateInvoicePdf(id);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
