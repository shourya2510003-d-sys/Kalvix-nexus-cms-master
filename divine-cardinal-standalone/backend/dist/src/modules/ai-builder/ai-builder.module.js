"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiBuilderModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const ai_builder_controller_1 = require("./ai-builder.controller");
const ai_builder_service_1 = require("./ai-builder.service");
const ai_builder_processor_1 = require("./ai-builder.processor");
const prisma_module_1 = require("../../prisma/prisma.module");
let AiBuilderModule = class AiBuilderModule {
};
exports.AiBuilderModule = AiBuilderModule;
exports.AiBuilderModule = AiBuilderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            bull_1.BullModule.registerQueue({
                name: 'ai-generation',
            }),
        ],
        controllers: [ai_builder_controller_1.AiBuilderController],
        providers: [ai_builder_service_1.AiBuilderService, ai_builder_processor_1.AiBuilderProcessor],
        exports: [ai_builder_service_1.AiBuilderService],
    })
], AiBuilderModule);
//# sourceMappingURL=ai-builder.module.js.map