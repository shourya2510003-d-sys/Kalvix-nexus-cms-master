import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const API_URL = 'https://kalvix-nexus-production.up.railway.app/api';
    const configRes = await fetch(`${API_URL}/cms/layout/integrations/razorpay`, { cache: 'no-store' });
    
    if (!configRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch payment config' }, { status: 500 });
    }
    
    const text = await configRes.text();
    let config;
    try {
      config = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json({ error: 'Invalid payment config' }, { status: 500 });
    }

    if (!config?.enabled || !config?.keySecret) {
      return NextResponse.json({ error: 'Razorpay is not enabled' }, { status: 400 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', config.keySecret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Razorpay Verify Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
