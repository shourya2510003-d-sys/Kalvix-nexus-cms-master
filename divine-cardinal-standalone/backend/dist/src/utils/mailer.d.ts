export declare class MailerService {
    private transporter;
    constructor();
    sendMail(to: string, subject: string, html: string): Promise<any>;
}
export declare const mailer: MailerService;
