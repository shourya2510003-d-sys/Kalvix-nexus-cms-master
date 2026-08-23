import { AiBuilderService } from './ai-builder.service';
export declare class AiBuilderController {
    private aiBuilderService;
    constructor(aiBuilderService: AiBuilderService);
    generatePage(body: {
        prompt: string;
        tenantId: string;
    }): Promise<{
        success: boolean;
        jobId: import("bull").JobId;
        generationId: string;
    }>;
    generateSection(body: {
        prompt: string;
        tenantId: string;
        pageId: string;
    }): Promise<{
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
    parseSeoDoc(body: {
        documentText: string;
    }): Promise<{
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
