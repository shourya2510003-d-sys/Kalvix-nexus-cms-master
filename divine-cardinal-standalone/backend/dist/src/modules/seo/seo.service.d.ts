import { PrismaService } from '../../prisma/prisma.service';
export declare class SeoService {
    private prisma;
    private readonly logger;
    private searchconsole;
    private isConfigured;
    private siteUrl;
    constructor(prisma: PrismaService);
    private initGSC;
    getGscMetrics(credentials?: {
        clientEmail?: string;
        privateKey?: string;
        siteUrl?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            indexed: number;
            notIndexed: number;
            lcp: string;
            cls: string;
            inp: string;
            analytics?: undefined;
        };
        error?: undefined;
    } | {
        success: boolean;
        data: {
            indexed: number;
            notIndexed: number;
            lcp: string;
            cls: string;
            inp: string;
            analytics: any;
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
}
