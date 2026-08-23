import * as twilio from 'twilio';

// Use environment variables for Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_PHONE_NUMBER; // e.g., 'whatsapp:+14155238886'

let client: twilio.Twilio | null = null;
if (accountSid && authToken && accountSid !== 'ACplaceholder') {
  try {
    client = twilio(accountSid, authToken);
  } catch (error) {
    console.warn("Twilio client initialization failed:", error);
  }
}

export const sendWhatsAppNotification = async (to: string, message: string) => {
  if (!client) {
    console.warn(`Twilio not configured. Skipping WhatsApp message to ${to}: ${message}`);
    return;
  }

  // Ensure the 'to' number is formatted correctly for WhatsApp
  // Note: For Twilio sandbox, the recipient must have joined the sandbox first
  let cleanNumber = to.replace(/[^0-9+]/g, '');
  if (!cleanNumber.startsWith('+')) {
    cleanNumber = `+91${cleanNumber.replace(/^0+/, '')}`; // Default to India (+91) if no country code is provided
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
  } catch (error) {
    console.error(`Failed to send WhatsApp message to ${formattedTo}:`, error);
    // Don't throw, we don't want to break the checkout flow if WhatsApp fails
  }
};
