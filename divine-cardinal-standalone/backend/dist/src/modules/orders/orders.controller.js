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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const passport_1 = require("@nestjs/passport");
const client_1 = require("@prisma/client");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async getCart(req) {
        return this.ordersService.getCart(req.user.id);
    }
    async syncCart(req, items) {
        return this.ordersService.syncCart(req.user.id, items);
    }
    async validateCoupon(req, code, amount) {
        return this.ordersService.validateCoupon(code, amount, req.tenantId);
    }
    async checkShipping(pincode, weight) {
        return this.ordersService.calculateShipping(pincode, weight);
    }
    async createOrder(req, shippingAddressId, billingAddressId, couponCode, paymentMethod, notes) {
        return this.ordersService.createOrder(req.user.id, {
            shippingAddressId,
            billingAddressId,
            couponCode,
            paymentMethod: paymentMethod || client_1.PaymentMethod.COD,
            notes,
        }, req.tenantId);
    }
    async getHistory(req) {
        return this.ordersService.getUserOrders(req.user.id, req.tenantId);
    }
    async getDetails(id, req) {
        return this.ordersService.getOrderDetails(id, req.user.id);
    }
    async downloadInvoice(id, res) {
        const pdfBuffer = await this.ordersService.generateInvoicePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
            'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)('cart'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getCart", null);
__decorate([
    (0, common_1.Post)('cart/sync'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('items')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "syncCart", null);
__decorate([
    (0, common_1.Get)('coupon/validate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('code')),
    __param(2, (0, common_1.Query)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "validateCoupon", null);
__decorate([
    (0, common_1.Get)('shipping/serviceability'),
    __param(0, (0, common_1.Query)('pincode')),
    __param(1, (0, common_1.Query)('weight')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "checkShipping", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('shippingAddressId')),
    __param(2, (0, common_1.Body)('billingAddressId')),
    __param(3, (0, common_1.Body)('couponCode')),
    __param(4, (0, common_1.Body)('paymentMethod')),
    __param(5, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getDetails", null);
__decorate([
    (0, common_1.Get)(':id/invoice'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "downloadInvoice", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map