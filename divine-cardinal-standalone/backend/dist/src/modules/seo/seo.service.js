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
var SeoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoService = void 0;
const common_1 = require("@nestjs/common");
const googleapis_1 = require("googleapis");
const prisma_service_1 = require("../../prisma/prisma.service");
let SeoService = SeoService_1 = class SeoService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SeoService_1.name);
        this.isConfigured = false;
        this.siteUrl = process.env.GSC_SITE_URL || 'https://divinecardinal.com/';
        this.initGSC();
    }
    initGSC() {
        try {
            const clientEmail = process.env.GSC_CLIENT_EMAIL;
            const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n');
            if (!clientEmail || !privateKey) {
                this.logger.warn('GSC_CLIENT_EMAIL or GSC_PRIVATE_KEY is missing. Google Search Console API will be disabled.');
                return;
            }
            const auth = new googleapis_1.google.auth.GoogleAuth({
                credentials: {
                    client_email: clientEmail,
                    private_key: privateKey,
                },
                scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
            });
            this.searchconsole = googleapis_1.google.searchconsole({ version: 'v1', auth });
            this.isConfigured = true;
            this.logger.log('Google Search Console API configured successfully.');
        }
        catch (error) {
            this.logger.error('Failed to initialize Google Search Console API', error);
        }
    }
    async getGscMetrics(credentials) {
        const clientEmail = credentials?.clientEmail || process.env.GSC_CLIENT_EMAIL;
        const privateKey = credentials?.privateKey?.replace(/\\n/g, '\n') || process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const siteUrl = credentials?.siteUrl || this.siteUrl;
        let isConfigured = this.isConfigured;
        let searchconsole = this.searchconsole;
        if (credentials?.clientEmail && credentials?.privateKey) {
            try {
                const auth = new googleapis_1.google.auth.GoogleAuth({
                    credentials: {
                        client_email: clientEmail,
                        private_key: privateKey,
                    },
                    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
                });
                searchconsole = googleapis_1.google.searchconsole({ version: 'v1', auth });
                isConfigured = true;
            }
            catch (err) {
                this.logger.error('Failed to init dynamic GSC client', err);
            }
        }
        if (!isConfigured) {
            this.logger.warn('GSC not configured, returning mock metrics');
            return {
                success: true,
                message: 'Mock data returned (Google Search Console is not configured)',
                data: {
                    indexed: 142,
                    notIndexed: 12,
                    lcp: 'Good (1.2s)',
                    cls: 'Good (0.01)',
                    inp: 'Good (42ms)'
                }
            };
        }
        try {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() - 3);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            const analyticsResponse = await searchconsole.searchanalytics.query({
                siteUrl: siteUrl,
                requestBody: {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    dimensions: ['date'],
                    rowLimit: 1,
                },
            });
            let indexedCount = 0;
            let notIndexedCount = 0;
            try {
                const sitemapsResponse = await searchconsole.sitemaps.list({
                    siteUrl: siteUrl,
                });
                if (sitemapsResponse.data.sitemap) {
                    for (const sitemap of sitemapsResponse.data.sitemap) {
                        indexedCount += parseInt(sitemap.contents?.[0]?.indexed || '0', 10);
                        const submitted = parseInt(sitemap.contents?.[0]?.submitted || '0', 10);
                        if (submitted > indexedCount) {
                            notIndexedCount += (submitted - indexedCount);
                        }
                    }
                }
            }
            catch (err) {
                this.logger.warn('Failed to fetch sitemap stats', err);
            }
            return {
                success: true,
                data: {
                    indexed: indexedCount,
                    notIndexed: notIndexedCount,
                    lcp: 'Requires CrUX API',
                    cls: 'Requires CrUX API',
                    inp: 'Requires CrUX API',
                    analytics: analyticsResponse.data.rows || [],
                }
            };
        }
        catch (error) {
            this.logger.error('Error fetching GSC metrics', error.message);
            return {
                success: false,
                message: 'Failed to fetch metrics from Google Search Console API.',
                error: error.message
            };
        }
    }
};
exports.SeoService = SeoService;
exports.SeoService = SeoService = SeoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeoService);
//# sourceMappingURL=seo.service.js.map