import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { amount, currency = 'INR', receipt } = await req.json();

    // 1. Fetch Razorpay config from backend
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

    if (!config?.enabled || !config?.keyId || !config?.keySecret) {
      return NextResponse.json({ error: 'Razorpay is not enabled or missing keys' }, { status: 400 });
    }

    const instance = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency,
      receipt: receipt || `rcpt_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    
    // We return the keyId so the frontend can initialize Razorpay Modal
    return NextResponse.json({ 
      success: true, 
      order,
      keyId: config.keyId 
    });

  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
