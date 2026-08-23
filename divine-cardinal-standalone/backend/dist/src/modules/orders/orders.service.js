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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const PDFDocument = require("pdfkit");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCart(userId) {
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
    async syncCart(userId, items) {
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
    async validateCoupon(code, orderAmount, tenantId) {
        const couponWhere = { code: code.toUpperCase() };
        if (tenantId)
            couponWhere.tenantId = tenantId;
        const coupon = await this.prisma.coupon.findFirst({
            where: couponWhere,
        });
        if (!coupon || !coupon.isActive) {
            throw new common_1.BadRequestException('Invalid or inactive coupon code');
        }
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            throw new common_1.BadRequestException('Coupon has expired');
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            throw new common_1.BadRequestException('Coupon usage limit reached');
        }
        if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
            throw new common_1.BadRequestException(`Minimum order amount for this coupon is Rs. ${coupon.minOrderAmount}`);
        }
        let discount = 0;
        if (coupon.type === 'PERCENTAGE') {
            discount = (orderAmount * Number(coupon.value)) / 100;
            if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
                discount = Number(coupon.maxDiscount);
            }
        }
        else {
            discount = Number(coupon.value);
        }
        return {
            valid: true,
            discountAmount: discount,
            code: coupon.code,
        };
    }
    async calculateShipping(postalCode, orderWeight) {
        const isServiceable = postalCode.length === 6 && !postalCode.startsWith('0');
        if (!isServiceable) {
            throw new common_1.BadRequestException('Destination postal code is not serviceable');
        }
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
    async createOrder(userId, data, tenantId) {
        const cart = await this.getCart(userId);
        if (cart.length === 0) {
            throw new common_1.BadRequestException('Cart is empty');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        let subtotal = 0;
        let totalWeight = 0;
        for (const item of cart) {
            subtotal += Number(item.variant.price) * item.quantity;
            totalWeight += (item.variant.weight || 100) * item.quantity;
        }
        const address = await this.prisma.address.findUnique({
            where: { id: data.shippingAddressId },
        });
        if (!address || address.userId !== userId) {
            throw new common_1.BadRequestException('Invalid shipping address');
        }
        const shipping = await this.calculateShipping(address.postalCode, totalWeight);
        let shippingCost = shipping.shippingCost;
        if (subtotal >= 999) {
            shippingCost = 0;
        }
        let discountAmount = 0;
        if (data.couponCode) {
            const couponVal = await this.validateCoupon(data.couponCode, subtotal, tenantId);
            discountAmount = couponVal.discountAmount;
            await this.prisma.coupon.update({
                where: { code: data.couponCode.toUpperCase() },
                data: { usageCount: { increment: 1 } },
            });
        }
        const taxAmount = (subtotal - discountAmount) * 0.18;
        const totalAmount = subtotal + shippingCost - discountAmount;
        for (const item of cart) {
            if (item.variant.inventoryQuantity < item.quantity) {
                throw new common_1.BadRequestException(`Product variant ${item.variant.sku} is out of stock`);
            }
        }
        const order = await this.prisma.$transaction(async (tx) => {
            const count = await tx.order.count();
            const orderNumber = `KV-${new Date().getFullYear()}-${10000 + count}`;
            for (const item of cart) {
                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: { inventoryQuantity: { decrement: item.quantity } },
                });
            }
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
                            status: client_1.OrderStatus.PENDING,
                            comment: 'Order placed successfully.',
                        },
                    },
                },
            });
            await tx.cartItem.deleteMany({ where: { userId } });
            return newOrder;
        });
        return order;
    }
    async getUserOrders(userId, tenantId) {
        const whereClause = { userId };
        if (tenantId)
            whereClause.tenantId = tenantId;
        return this.prisma.order.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: { items: true },
        });
    }
    async getOrderDetails(orderId, userId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: true,
                history: true,
                user: { select: { firstName: true, lastName: true, email: true, phone: true } },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (userId && order.userId !== userId) {
            throw new common_1.UnauthorizedException('Access denied');
        }
        return order;
    }
    async generateInvoicePdf(orderId) {
        const order = await this.getOrderDetails(orderId);
        return new Promise((resolve) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.fontSize(20).text('KALVIX NEXUS INVOICE', { align: 'center' }).moveDown();
            doc.fontSize(10).text(`Order Number: ${order.orderNumber}`);
            doc.text(`Order Date: ${order.createdAt.toLocaleDateString()}`);
            doc.text(`Payment Method: ${order.paymentMethod}`);
            doc.text(`Payment Status: ${order.paymentStatus}`).moveDown();
            doc.fontSize(12).text('Shipping Details:', { underline: true });
            doc.fontSize(10).text(`Customer: ${order.user.firstName} ${order.user.lastName}`);
            doc.text(`Email: ${order.user.email}`);
            doc.text(`Phone: ${order.user.phone || 'N/A'}`).moveDown();
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map