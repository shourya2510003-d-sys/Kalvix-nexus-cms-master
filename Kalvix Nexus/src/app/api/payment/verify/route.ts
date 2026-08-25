import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminFirestore, adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, storeName, plan, uid, themeId } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Razorpay secret missing' }, { status: 500 });
    }

    // Verify signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return NextResponse.json({ error: 'Transaction not legit!' }, { status: 400 });
    }

    // Payment is verified. Now provision the store.
    
    // Normalize store name for subdomain (lowercase, alphanumeric, hyphens)
    const subdomain = storeName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    // 1. Create Tenant Record in Firestore
    const tenantRef = adminFirestore.collection('tenants').doc(subdomain);
    const tenantDoc = await tenantRef.get();
    
    if (tenantDoc.exists) {
       // This shouldn't happen if frontend checked availability, but handle edge case
       return NextResponse.json({ error: 'Store subdomain already exists. Contact support.' }, { status: 409 });
    }

    await tenantRef.set({
      subdomain,
      ownerId: uid,
      storeName,
      plan,
      createdAt: new Date().toISOString(),
      status: 'active',
      themeId: themeId || 'default'
    });

    // 2. Set Custom User Claims for Tenant Admin
    await adminAuth.setCustomUserClaims(uid, { tenant_admin: true, tenant_id: subdomain });

    return NextResponse.json({ success: true, subdomain, msg: 'Payment verified and store provisioned successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
