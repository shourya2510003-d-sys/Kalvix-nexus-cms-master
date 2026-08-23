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
exports.AiBuilderController = void 0;
const common_1 = require("@nestjs/common");
const ai_builder_service_1 = require("./ai-builder.service");
let AiBuilderController = class AiBuilderController {
    constructor(aiBuilderService) {
        this.aiBuilderService = aiBuilderService;
    }
    async generatePage(body) {
        const { prompt, tenantId } = body;
        return this.aiBuilderService.queuePageGeneration(tenantId, prompt);
    }
    async generateSection(body) {
        const { prompt, tenantId, pageId } = body;
        return this.aiBuilderService.queueSectionGeneration(tenantId, pageId, prompt);
    }
    async getJobStatus(jobId) {
        return this.aiBuilderService.getJobStatus(jobId);
    }
    async parseSeoDoc(body) {
        return this.aiBuilderService.parseSeoDoc(body.documentText);
    }
};
exports.AiBuilderController = AiBuilderController;
__decorate([
    (0, common_1.Post)('generate/page'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiBuilderController.prototype, "generatePage", null);
__decorate([
    (0, common_1.Post)('generate/section'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiBuilderController.prototype, "generateSection", null);
__decorate([
    (0, common_1.Get)('status/:jobId'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiBuilderController.prototype, "getJobStatus", null);
__decorate([
    (0, common_1.Post)('parse-seo-doc'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiBuilderController.prototype, "parseSeoDoc", null);
exports.AiBuilderController = AiBuilderController = __decorate([
    (0, common_1.Controller)('ai-builder'),
    __metadata("design:paramtypes", [ai_builder_service_1.AiBuilderService])
], AiBuilderController);
//# sourceMappingURL=ai-builder.controller.js.map