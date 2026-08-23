import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AiBuilderService {
    private aiQueue;
    private prisma;
    private readonly logger;
    constructor(aiQueue: Queue, prisma: PrismaService);
    queuePageGeneration(tenantId: string, prompt: string): Promise<{
        success: boolean;
        jobId: import("bull").JobId;
        generationId: string;
    }>;
    queueSectionGeneration(tenantId: string, pageId: string, prompt: string): Promise<{
        success: boolean;
        jobId: import("bull").JobId;
        generationId: string;
    }>;
    getJobStatus(jobId: string): Promise<{
        status: string;
        progress?: undefined;
        result?: undefined;
        error?: undefined;
    } | {
        status: import("bull").JobStatus | "stuck";
        progress: any;
        result: any;
        error: string;
    }>;
    parseSeoDoc(documentText: string): Promise<{
        success: boolean;
        error: string;
        rawResponse: string;
        data?: undefined;
    } | {
        success: boolean;
        data: any;
        error?: undefined;
        rawResponse?: undefined;
    } | {
        success: boolean;
        error: any;
        rawResponse?: undefined;
        data?: undefined;
    }>;
}
