"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailer = exports.MailerService = void 0;
const nodemailer = require("nodemailer");
class MailerService {
    constructor() {
        if (process.env.SMTP_HOST) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        }
        else if (process.env.SMTP_URL) {
            this.transporter = nodemailer.createTransport(process.env.SMTP_URL);
        }
        else {
            this.transporter = nodemailer.createTransport({
                streamTransport: true,
                newline: 'unix',
            });
        }
    }
    async sendMail(to, subject, html) {
        if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST && !process.env.SMTP_URL) {
            console.log(`\n================= EMAIL DISPATCH =================`);
            console.log(`To: ${to}\nSubject: ${subject}\n\n${html.replace(/<[^>]*>?/gm, '')}`);
            console.log(`==================================================\n`);
        }
        try {
            const fromName = process.env.SMTP_FROM_NAME || 'Kalvix Nexus Support';
            const fromEmail = process.env.SMTP_FROM || 'noreply@kalvixnexus.com';
            const info = await this.transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to,
                subject,
                html,
            });
            return info;
        }
        catch (e) {
            console.error('Error sending email:', e);
        }
    }
}
exports.MailerService = MailerService;
exports.mailer = new MailerService();
//# sourceMappingURL=mailer.js.map