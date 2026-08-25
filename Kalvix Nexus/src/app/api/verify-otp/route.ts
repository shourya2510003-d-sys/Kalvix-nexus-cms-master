import { NextResponse } from 'next/server';
import { ref, get, remove } from 'firebase/database';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const safeEmail = email.replace(/[.#$\[\]]/g, '_');
    const otpRef = ref(db, `registration_otps/${safeEmail}`);
    
    const snapshot = await get(otpRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const data = snapshot.val();
    
    if (Date.now() > data.expiresAt) {
      await remove(otpRef); // Clean up expired OTP
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (data.otp !== otp) {
      return NextResponse.json({ error: 'Incorrect OTP' }, { status: 400 });
    }

    // OTP is valid! Clean it up so it can't be reused.
    await remove(otpRef);

    return NextResponse.json({ success: true, message: 'OTP verified successfully' });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify OTP' }, { status: 500 });
  }
}
