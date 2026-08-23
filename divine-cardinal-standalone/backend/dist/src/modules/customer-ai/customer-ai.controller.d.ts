import { CustomerAiService } from './customer-ai.service';
export declare class CustomerAiController {
    private customerAiService;
    constructor(customerAiService: CustomerAiService);
    chat(body: {
        message: string;
        history?: any[];
    }): Promise<{
        reply: string;
    }>;
}
