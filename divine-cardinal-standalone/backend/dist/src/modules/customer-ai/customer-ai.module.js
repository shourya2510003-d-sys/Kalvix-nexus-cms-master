"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerAiModule = void 0;
const common_1 = require("@nestjs/common");
const customer_ai_controller_1 = require("./customer-ai.controller");
const customer_ai_service_1 = require("./customer-ai.service");
const prisma_module_1 = require("../../prisma/prisma.module");
let CustomerAiModule = class CustomerAiModule {
};
exports.CustomerAiModule = CustomerAiModule;
exports.CustomerAiModule = CustomerAiModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [customer_ai_controller_1.CustomerAiController],
        providers: [customer_ai_service_1.CustomerAiService],
        exports: [customer_ai_service_1.CustomerAiService],
    })
], CustomerAiModule);
//# sourceMappingURL=customer-ai.module.js.map