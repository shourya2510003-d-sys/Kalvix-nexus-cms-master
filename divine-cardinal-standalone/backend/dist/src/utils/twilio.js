"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppNotification = void 0;
const twilio = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_PHONE_NUMBER;
let client = null;
if (accountSid && authToken && accountSid !== 'ACplaceholder') {
    try {
        client = twilio(accountSid, authToken);
    }
    catch (error) {
        console.warn("Twilio client initialization failed:", error);
    }
}
const sendWhatsAppNotification = async (to, message) => {
    if (!client) {
        console.warn(`Twilio not configured. Skipping WhatsApp message to ${to}: ${message}`);
        return;
    }
    let cleanNumber = to.replace(/[^0-9+]/g, '');
    if (!cleanNumber.startsWith('+')) {
        cleanNumber = `+91${cleanNumber.replace(/^0+/, '')}`;
    }
    const formattedTo = `whatsapp:${cleanNumber}`;
    const formattedFrom = twilioWhatsAppNumber?.startsWith('whatsapp:') ? twilioWhatsAppNumber : `whatsapp:${twilioWhatsAppNumber}`;
    try {
        const response = await client.messages.create({
            body: message,
            from: formattedFrom,
            to: formattedTo,
        });
        console.log(`WhatsApp message sent to ${formattedTo}. Message SID: ${response.sid}`);
        return response;
    }
    catch (error) {
        console.error(`Failed to send WhatsApp message to ${formattedTo}:`, error);
    }
};
exports.sendWhatsAppNotification = sendWhatsAppNotification;
//# sourceMappingURL=twilio.js.map