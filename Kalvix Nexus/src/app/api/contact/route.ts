import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Simple HTML escaping helper to prevent XSS injection in HTML emails
const escapeHtml = (text: string): string => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    const name = escapeHtml(payload.name);
    const email = escapeHtml(payload.email);
    const message = escapeHtml(payload.message);

    // Basic server-side validation
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY is not defined. Using mock mail transmission.');
    }

    const client = new Resend(resendApiKey || 'mock_key');
    
    await client.emails.send({
      from: 'Kalvix Nexus Contact <contact@kalvixnexus.com>',
      to: 'kalvixnexus@gmail.com',
      subject: `New Inquiry from ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #B8860B; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-top: 0;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email Address:</strong> ${email}</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; margin-top: 20px;">
            <p style="margin-top: 0; font-weight: bold;">Message Details:</p>
            <p style="white-space: pre-wrap; margin-bottom: 0; line-height: 1.6;">${message}</p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const errorId = Math.random().toString(36).substring(7);
    console.error(`[ErrorID: ${errorId}] Email transmission error:`, err);
    return NextResponse.json({ success: false, error: 'Internal Server Error', errorId }, { status: 500 });
  }
}