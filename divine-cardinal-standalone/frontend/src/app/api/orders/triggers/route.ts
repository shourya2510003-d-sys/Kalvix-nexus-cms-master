import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const ADMIN_WHATSAPP = '917417101700'; // Admin WhatsApp without + for Meta API
const META_ACCESS_TOKEN = 'EAAOxldf6VRYBSEz6QyXfHNIV4VXQjyszJZCfjFq6Hnb2hX79v1hrNO4f9Y65ZCzeWR75iWQnxrXWBS2BP5xnycY8lz99QR2ZCNaHeZCSzbi1sx0vsuLFLd9ZBHpUZBZCfbfaZCR6kp8l8XcI5S3ZCPXbLZAMOYQyi6K4h4biDSYuG93xBp0HmZA4YvMZA7GV5mwMMX5t67uMdo45XoZBDclREifLV1yrU78l2AIC2yRdMyfYe6ZAZBeZBgQtZBbn1yPsv4uvBbwdiNidvJ1a2oJwMPmr46O0HZAAZDZD';
const META_PHONE_ID = '1020188901185964';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' service to automatically set host and port
  auth: {
    user: 'dcihathras@gmail.com', // Admin email
    pass: 'xkbg vrhy rmur iitu', // App Password
  }
});

// Helper function to send WhatsApp via Meta API
async function sendMetaWhatsApp(to: string, textBody: string) {
  const endpoint = `https://graph.facebook.com/v17.0/${META_PHONE_ID}/messages`;
  let formattedTo = to.replace(/\D/g, ''); // Ensure phone number is only digits
  if (formattedTo.length === 10) {
    formattedTo = '91' + formattedTo;
  }
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: formattedTo,
    type: "text",
    text: {
      body: textBody
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Meta API failed');
  }
  return data;
}

export async function POST(req: Request) {
  try {
    const { order, address } = await req.json();
    const customerName = `${address.firstName || ''} ${address.lastName || ''}`.trim() || 'Customer';
    const orderId = order.id || order.orderNumber;
    const amount = order.total || order.totalAmount;
    const trackingUrl = order.trackingUrl || '';
    const trackingNum = order.trackingNumber || '';
    
    // 1. Send Customer WhatsApp Notification
    if (address.phone) {
      try {
        const customerMsg = `Hi ${customerName}, your order ${orderId} has been confirmed!\nTrack here: ${trackingNum || 'Processing'}\nTotal Amount: ₹${amount}`;
        await sendMetaWhatsApp(address.phone, customerMsg);
        console.log("Customer WhatsApp sent via Meta.");
      } catch (e: any) {
        console.error("Customer WhatsApp Error:", e.message);
      }
    }

    // 2. Send Admin WhatsApp Notification
    if (ADMIN_WHATSAPP) {
      try {
        const adminMsg = `New Order from ${customerName}!\nOrder ID: ${orderId}\nTotal Amount: ₹${amount}\nPayment: ${order.paymentStatus}`;
        await sendMetaWhatsApp(ADMIN_WHATSAPP, adminMsg);
        console.log("Admin WhatsApp sent via Meta.");
      } catch (e: any) {
        console.error("Admin WhatsApp Error:", e.message);
      }
    }

    // 3. Send Customer Email Notification
    if (address.email) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
            <h2 style="color: #008060; text-align: center;">Order Confirmed! 🎉</h2>
            <p>Hi <strong>${customerName}</strong>,</p>
            <p>Thank you for shopping with us. Your order <strong>${orderId}</strong> has been successfully placed.</p>
            <p><strong>Total Amount:</strong> ₹${amount}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            ${trackingUrl ? `<p><strong>Track Your Order:</strong> <br><a href="${trackingUrl}" style="display:inline-block; margin-top:5px; padding:8px 15px; background-color:#008060; color:#fff; text-decoration:none; border-radius:4px;">Click Here to Track (AWB: ${trackingNum})</a></p>` : `<p>We'll send you shipping details soon.</p>`}
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px; text-align: center;">Kalvix Nexus Team</p>
          </div>
        `;
        
        await transporter.sendMail({
          from: '"Kalvix Nexus" <dcihathras@gmail.com>',
          to: address.email,
          subject: `Order Confirmed: ${orderId}`,
          html: emailHtml
        });
        
        // Also send a copy to Admin
        await transporter.sendMail({
          from: '"Kalvix Nexus" <dcihathras@gmail.com>',
          to: 'dcihathras@gmail.com',
          subject: `New Order Alert: ${orderId}`,
          html: `<p>New order received from ${customerName} for ₹${amount}.</p>
                 <p>Customer Email: ${address.email}</p>
                 <p>Customer Phone: ${address.phone}</p>
                 <p>Delhivery AWB: ${trackingNum || 'N/A'}</p>`
        });
        
        console.log(`Email sent to ${address.email} and Admin`);
      } catch (e: any) {
        console.error("Email Error:", e.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Triggers Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

