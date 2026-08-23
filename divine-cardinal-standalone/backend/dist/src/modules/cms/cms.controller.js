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
exports.CmsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = require("fs");
const cms_service_1 = require("./cms.service");
let CmsController = class CmsController {
    constructor(cmsService) {
        this.cmsService = cmsService;
    }
    async uploadFile(file, req) {
        if (!file)
            throw new Error('No file uploaded');
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
            cloud_name: 'qdq7ult5',
            api_key: '677224231391214',
            api_secret: 'xxxeSIdBn8CVDZ_bZvq2PfYCo8Q'
        });
        try {
            const ext = (0, path_1.extname)(file.originalname).toLowerCase();
            const uploadOptions = {
                folder: 'kalvix_nexus/uploads',
                resource_type: 'auto'
            };
            if (['.tif', '.tiff', '.bmp', '.png', '.jpeg', '.jpg', '.webp'].includes(ext)) {
                uploadOptions.format = 'jpg';
            }
            const result = await cloudinary.uploader.upload(file.path, uploadOptions);
            fs.unlinkSync(file.path);
            return { url: result.secure_url, filename: file.originalname, size: result.bytes || file.size, mimetype: uploadOptions.format ? 'image/jpeg' : file.mimetype };
        }
        catch (err) {
            console.error('Cloudinary upload failed:', err);
            const host = req.get('host');
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            return { url: `${protocol}://${host}/uploads/${file.filename}`, filename: file.filename, size: file.size, mimetype: file.mimetype };
        }
    }
    async getStorageFiles(req) {
        const dir = './uploads';
        if (!fs.existsSync(dir)) {
            return [];
        }
        const files = fs.readdirSync(dir);
        const host = req.get('host');
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        return files.map(filename => {
            const stats = fs.statSync(`${dir}/${filename}`);
            return {
                filename,
                url: `${protocol}://${host}/uploads/${filename}`,
                size: stats.size,
                createdAt: stats.birthtime,
            };
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async deleteStorageFile(filename) {
        const filePath = `./uploads/${filename}`;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return { success: true };
        }
        return { success: false, message: 'File not found' };
    }
    async getLayout(pageId, req) {
        console.log("LAYOUT REQUEST", pageId, req.params);
        const tenantId = req.tenantId;
        return this.cmsService.getLayout(pageId, tenantId);
    }
    async saveLayout(pageId, config, req) {
        console.log("LAYOUT REQUEST", pageId, req.params);
        const tenantId = req.tenantId;
        return this.cmsService.saveLayout(pageId, config, tenantId);
    }
    async getHomepage() {
        return this.cmsService.getHomepageCMS();
    }
    async getBlogs() {
        return this.cmsService.getBlogs();
    }
    async getBlog(slug) {
        return this.cmsService.getBlogBySlug(slug);
    }
    async getFaqs() {
        return this.cmsService.getGlobalFAQs();
    }
    async runCleanupAndOptimize() {
        return this.cmsService.runCleanupAndOptimize();
    }
};
exports.CmsController = CmsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dir = './uploads';
                if (!fs.existsSync(dir))
                    fs.mkdirSync(dir, { recursive: true });
                cb(null, dir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            }
        })
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('storage'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getStorageFiles", null);
__decorate([
    (0, common_1.Delete)('storage/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "deleteStorageFile", null);
__decorate([
    (0, common_1.Get)('layout/*'),
    __param(0, (0, common_1.Param)('0')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getLayout", null);
__decorate([
    (0, common_1.Post)('layout/*'),
    __param(0, (0, common_1.Param)('0')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "saveLayout", null);
__decorate([
    (0, common_1.Get)('homepage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getHomepage", null);
__decorate([
    (0, common_1.Get)('blogs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getBlogs", null);
__decorate([
    (0, common_1.Get)('blogs/:slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getBlog", null);
__decorate([
    (0, common_1.Get)('faqs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "getFaqs", null);
__decorate([
    (0, common_1.Get)('run-cleanup-and-optimize'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CmsController.prototype, "runCleanupAndOptimize", null);
exports.CmsController = CmsController = __decorate([
    (0, common_1.Controller)('cms'),
    __metadata("design:paramtypes", [cms_service_1.CmsService])
], CmsController);
//# sourceMappingURL=cms.controller.js.map