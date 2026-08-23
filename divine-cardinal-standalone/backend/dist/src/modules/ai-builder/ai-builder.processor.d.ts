import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AiBuilderProcessor {
    private prisma;
    private readonly logger;
    private genAI;
    constructor(prisma: PrismaService);
    handlePageGeneration(job: Job): Promise<{
        success: boolean;
        pageId: string;
    }>;
    handleSectionGeneration(job: Job): Promise<{
        success: boolean;
    }>;
}
