import { PrismaService } from '../../prisma/prisma.service';
export declare class CustomerAiService {
    private prisma;
    private readonly logger;
    private genAI;
    constructor(prisma: PrismaService);
    handleChat(message: string, history: any[]): Promise<{
        reply: string;
    }>;
}
