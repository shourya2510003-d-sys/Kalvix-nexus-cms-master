import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Get user persistent cart
  async getCart(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: {
            product: {
              include: { images: { orderBy: { position: 'asc' }, take: 1 } },
            },
          },
        },
      },
    });
  }

  // Synchronize cart (bulk upload from frontend local storage on login)
  async syncCart(userId: string, items: { variantId: string; quantity: number }[]) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    
    if (items.length > 0) {
      await this.prisma.cartItem.createMany({
        data: items.map((i) => ({
          userId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });
    }

    return this.getCart(userId);
  }

  // Check coupon validity
  async validateCoupon(code: string, orderAmount: number, tenantId?: string) {
    const couponWhere: any = { code: code.toUpperCase() };
    if (tenantId) couponWhere.tenantId = tenantId;

    const coupon = await this.prisma.coupon.findFirst({
      where: couponWhere,
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('Invalid or inactive coupon code');
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(`Minimum order amount for this coupon is Rs. ${coupon.minOrderAmount}`);
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (orderAmount * Number(coupon.value)) / 100;
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else {
      discount = Number(coupon.value);
    }

    return {
      valid: true,
      discountAmount: discount,
      code: coupon.code,
    };
  }

  // Calculate Shipping (Shiprocket integration mock)
  async calculateShipping(postalCode: string, orderWeight: number) {
    // In production, you would fetch real shipping rates from Shiprocket API:
    // POST https://apiv2.shiprocket.in/v1/external/courier/serviceability/
    // We mock the serviceability response:
    const isServiceable = postalCode.length === 6 && !postalCode.startsWith('0');
    if (!isServiceable) {
      throw new BadRequestException('Destination postal code is not serviceable');
    }

    // Base shipping: Rs. 99, free for light weights or premium zones
    const cost = orderWeight > 1000 ? 150 : 99;
    const estDeliveryDays = postalCode.startsWith('1') || postalCode.startsWith('2') ? 2 : 5;
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + estDeliveryDays);

    return {
      shippingCost: cost,
      estimatedDelivery: deliveryDate,
      serviceable: true,
    };
  }

  // Create Order from Cart
  async createOrder(
    userId: string,
    data: {
      shippingAddressId: string;
      billingAddressId: string;
      couponCode?: string;
      paymentMethod: PaymentMethod;
      notes?: string;
    },
    tenantId?: string,
  ) {
    const cart = await this.getCart(userId);
    if (cart.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Calculate details
    let subtotal = 0;
    let totalWeight = 0;
    for (const item of cart) {
      subtotal += Number(item.variant.price) * item.quantity;
      totalWeight += (item.variant.weight || 100) * item.quantity;
    }

    // Address verification
    const address = await this.prisma.address.findUnique({
      where: { id: data.shippingAddressId },
    });
    if (!address || address.userId !== userId) {
      throw new BadRequestException('Invalid shipping address');
    }

    // Shipping calculations
    const shipping = await this.calculateShipping(address.postalCode, totalWeight);
    let shippingCost = shipping.shippingCost;
    
    // Free shipping threshold check (e.g. Rs. 999)
    if (subtotal >= 999) {
      shippingCost = 0;
    }

    // Coupon discount
    let discountAmount = 0;
    if (data.couponCode) {
      const couponVal = await this.validateCoupon(data.couponCode, subtotal, tenantId);
      discountAmount = couponVal.discountAmount;
      
      // Update coupon use count
      await this.prisma.coupon.update({
        where: { code: data.couponCode.toUpperCase() },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Taxes (18% GST included in basePrice, let's break it down on invoice)
    const taxAmount = (subtotal - discountAmount) * 0.18; // Breakdown indicator
    const totalAmount = subtotal + shippingCost - discountAmount;

    // Verify inventory quantities
    for (const item of cart) {
      if (item.variant.inventoryQuantity < item.quantity) {
        throw new BadRequestException(`Product variant ${item.variant.sku} is out of stock`);
      }
    }

    // Create Order within a database transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // 1. Generate Order Number
      const count = await tx.order.count();
      const orderNumber = `KV-${new Date().getFullYear()}-${10000 + count}`;

      // 2. Reduce variant inventory
      for (const item of cart) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { inventoryQuantity: { decrement: item.quantity } },
        });
      }

      // 3. Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          tenantId,
          shippingAddressId: data.shippingAddressId,
          billingAddressId: data.billingAddressId,
          shippingMethod: 'Express Shipping',
          shippingCost,
          taxAmount,
          couponCode: data.couponCode?.toUpperCase(),
          discountAmount,
          totalAmount,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          estimatedDelivery: shipping.estimatedDelivery,
          items: {
            create: cart.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.variant.price,
              name: item.variant.product.name,
              sku: item.variant.sku,
            })),
          },
          history: {
            create: {
              status: OrderStatus.PENDING,
              comment: 'Order placed successfully.',
            },
          },
        },
      });

      // 4. Clear User Cart
      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    return order;
  }

  // Get user order history
  async getUserOrders(userId: string, tenantId?: string) {
    const whereClause: any = { userId };
    if (tenantId) whereClause.tenantId = tenantId;

    return this.prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  // Find order by ID
  async getOrderDetails(orderId: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        history: true,
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userId && order.userId !== userId) {
      throw new UnauthorizedException('Access denied');
    }

    return order;
  }

  // Generate Invoice PDF
  async generateInvoicePdf(orderId: string): Promise<Buffer> {
    const order = await this.getOrderDetails(orderId);
    
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fontSize(20).text('KALVIX NEXUS INVOICE', { align: 'center' }).moveDown();
      doc.fontSize(10).text(`Order Number: ${order.orderNumber}`);
      doc.text(`Order Date: ${order.createdAt.toLocaleDateString()}`);
      doc.text(`Payment Method: ${order.paymentMethod}`);
      doc.text(`Payment Status: ${order.paymentStatus}`).moveDown();

      // Shipping details
      doc.fontSize(12).text('Shipping Details:', { underline: true });
      doc.fontSize(10).text(`Customer: ${order.user.firstName} ${order.user.lastName}`);
      doc.text(`Email: ${order.user.email}`);
      doc.text(`Phone: ${order.user.phone || 'N/A'}`).moveDown();

      // Table Header
      doc.fontSize(12).text('Items Ordered:', { underline: true }).moveDown(0.5);
      
      let y = doc.y;
      doc.fontSize(10);
      doc.text('Item Description', 50, y);
      doc.text('SKU', 250, y);
      doc.text('Qty', 350, y);
      doc.text('Price (INR)', 400, y);
      doc.text('Total (INR)', 480, y);
      doc.moveDown();

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Items
      order.items.forEach((item) => {
        y = doc.y;
        doc.text(item.name, 50, y, { width: 180 });
        doc.text(item.sku, 250, y);
        doc.text(item.quantity.toString(), 350, y);
        doc.text(`Rs. ${Number(item.price).toFixed(2)}`, 400, y);
        doc.text(`Rs. ${(Number(item.price) * item.quantity).toFixed(2)}`, 480, y);
        doc.moveDown();
      });

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Totals
      y = doc.y;
      doc.text('Shipping Cost:', 350, y);
      doc.text(`Rs. ${Number(order.shippingCost).toFixed(2)}`, 480, y);
      
      doc.moveDown(0.5);
      y = doc.y;
      doc.text('Discount Amount:', 350, y);
      doc.text(`Rs. ${Number(order.discountAmount).toFixed(2)}`, 480, y);

      doc.moveDown(0.5);
      y = doc.y;
      doc.fontSize(12).font('Helvetica-Bold').text('Total Paid:', 350, y);
      doc.font('Helvetica');
      doc.text(`Rs. ${Number(order.totalAmount).toFixed(2)}`, 480, y);

      doc.end();
    });
  }
}
