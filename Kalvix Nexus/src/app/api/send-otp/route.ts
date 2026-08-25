import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ref, set, get, remove } from 'firebase/database';
import { db } from '@/lib/firebase';

const resend = new Resend(process.env.RESEND_API_KEY || "YOUR_RESEND_API_KEY");

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Check if email is already registered anywhere
    const checkEmailInNode = async (node: string) => {
      const snapshot = await get(ref(db, node));
      if (!snapshot.exists()) return false;
      const data = snapshot.val();
      return Object.values(data).some((record: any) => record.email === email);
    };

    const isRegistered = 
      await checkEmailInNode('employees') || 
      await checkEmailInNode('pending_employees') || 
      await checkEmailInNode('clients') || 
      await checkEmailInNode('client_requests');

    if (isRegistered) {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 });
    }

    // Sanitize email for Firebase key (replace . # $ [ ] with _)
    const safeEmail = email.replace(/[.#$\[\]]/g, '_');
    
    // 2. Daily Rate Limiting & Auto Cleanup
    const today = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
    
    // Garbage Collection: Delete all old records from Firebase permanently
    const allLimitsSnapshot = await get(ref(db, 'otp_limits'));
    if (allLimitsSnapshot.exists()) {
      const allLimits = allLimitsSnapshot.val();
      for (const [key, data] of Object.entries(allLimits)) {
        if ((data as any).date !== today) {
          // It's a past day, remove it permanently from Firebase
          await remove(ref(db, `otp_limits/${key}`));
        }
      }
    }

    const limitRef = ref(db, `otp_limits/${safeEmail}`);
    const limitSnapshot = await get(limitRef);
    
    let newCount = 1;
    if (limitSnapshot.exists()) {
      const limitData = limitSnapshot.val();
      if (limitData.date === today) {
        if (limitData.count >= 3) {
          return NextResponse.json({ error: 'You have reached the maximum limit of 3 OTP requests for today. Please try again tomorrow.' }, { status: 429 });
        }
        newCount = limitData.count + 1;
      }
    }
    
    // Save updated limit
    await set(limitRef, { count: newCount, date: today });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to Firebase with expiration (2 minutes)
    const expiresAt = Date.now() + 2 * 60 * 1000;
    await set(ref(db, `registration_otps/${safeEmail}`), {
      otp,
      expiresAt,
    });

    // Determine dynamic greeting based on IST time
    const hourString = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata", hour: 'numeric', hour12: false});
    const hour = parseInt(hourString, 10);
    let greeting = "Good Evening";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 17) greeting = "Good Afternoon";

    // Send email using Resend
    const data = await resend.emails.send({
      from: 'Kalvix Nexus <care@kalvixnexus.com>',
      to: [email],
      subject: 'Your Kalvix Nexus Verification OTP',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 30px; background-color: #ffffff; border: 1px solid #eaeaec; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #D4AF37; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Kalvix Nexus</h1>
            <p style="color: #666; margin-top: 5px; font-size: 14px; letter-spacing: 1px;">Secure Verification</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;"><strong>${greeting}</strong>,</p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear <strong>${name || 'User'}</strong>,</p>
          <p style="color: #444; font-size: 15px; line-height: 1.6;">Thank you for initiating the registration process with Kalvix Nexus. To ensure the security of your account, please verify your email address using the One-Time Password (OTP) below:</p>
          
          <div style="background: linear-gradient(145deg, #f8f9fa, #e9ecef); padding: 25px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #111; border-radius: 8px; border-left: 5px solid #D4AF37; margin: 35px 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);">
            ${otp}
          </div>
          
          <p style="color: #d9534f; font-size: 13px; font-weight: 600; text-align: center; margin-bottom: 30px;">
            <span style="display: inline-block; padding: 6px 12px; background-color: #fdf2f2; border-radius: 20px;">⏱️ This security code will expire in exactly 2 minutes.</span>
          </p>
          
          <p style="color: #666; font-size: 13px; line-height: 1.5; border-top: 1px solid #eee; padding-top: 20px;">
            If you did not request this verification, please ignore this email. No further action is required.
          </p>
          
          <div style="margin-top: 40px; text-align: center;">
            <p style="color: #333; font-size: 14px; font-weight: 600; margin-bottom: 5px;">Best Regards,</p>
            <p style="color: #D4AF37; font-size: 16px; font-weight: bold; margin: 0;">Kalvix Nexus Team</p>
          </div>
        </div>
      `,
    });

    if (data.error) {
      console.error('Resend API Error:', data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
