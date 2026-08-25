'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import Script from 'next/script';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState<{ storeName: string; plan: string; amount: string; subdomain: string; themeId?: string } | null>(null);

  useEffect(() => {
    const storeName = sessionStorage.getItem('pendingStoreName');
    const subdomain = sessionStorage.getItem('pendingSubdomain');
    const plan = sessionStorage.getItem('selectedPlan');
    const amount = sessionStorage.getItem('planAmount');
    const themeId = sessionStorage.getItem('selectedThemeId') || 'default';

    if (!storeName || !subdomain || !plan || !amount) {
      router.push('/build-store');
    } else {
      setDetails({ storeName, subdomain, plan, amount, themeId });
    }
  }, [router]);

  const handlePayment = async () => {
    if (!details) return;
    setLoading(true);
    setError('');

    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to proceed.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order on backend
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseInt(details.amount) }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // 2. Open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use NEXT_PUBLIC_ for client side
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Kalvix Nexus',
        description: `Setup for ${details.storeName}`,
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            setIsProvisioning(true);
            setLoading(true);
            // 3. Verify on backend
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                storeName: details.storeName,
                plan: details.plan,
                uid: user.uid,
                themeId: details.themeId
              }),
            });
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok) {
              // Success! Clear session storage and redirect to tenant admin
              sessionStorage.removeItem('pendingStoreName');
              sessionStorage.removeItem('pendingSubdomain');
              sessionStorage.removeItem('selectedPlan');
              sessionStorage.removeItem('planAmount');
              sessionStorage.removeItem('selectedThemeId');
              
              // We could force a token refresh here so the new custom claim is picked up
              await user.getIdToken(true);
              
              window.location.href = `http://${verifyData.subdomain}.localhost:3001`; // Local testing redirect. In prod, point to actual domain.
            } else {
              setError(verifyData.error || 'Payment verification failed');
            }
          } catch (err: any) {
            setError('An error occurred during verification');
            setIsProvisioning(false);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.displayName || 'Customer',
          email: user.email,
        },
        theme: {
          color: '#D4AF37', // Gold primary
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description);
        setLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      setError(err.message || 'Could not initialize payment');
      setLoading(false);
    }
  };

  if (!details) return null;

  if (isProvisioning) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-6 relative">
        <Loader2 className="w-16 h-16 text-gold-primary animate-spin mb-6" />
        <h2 className="font-orbitron font-bold text-2xl text-gold-primary animate-pulse tracking-widest text-center">PROVISIONING YOUR STORE...</h2>
        <p className="text-text-muted mt-4 text-sm text-center max-w-md">
          Please do not close this window. We are securely configuring your tenant database, assigning admin rights, and preparing your subdomain.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-6 relative">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="w-full max-w-md bg-bg-card border border-gold-primary/20 rounded-2xl p-8 relative z-10 shadow-2xl">
        <h1 className="font-orbitron font-black text-2xl text-center uppercase tracking-widest mb-6">Checkout</h1>
        
        <div className="bg-bg-primary p-4 rounded-lg border border-gold-primary/10 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Store Name</span>
            <span className="font-bold">{details.storeName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Subdomain</span>
            <span className="font-mono text-gold-light">{details.subdomain}.kalvixnexus.com</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Selected Plan</span>
            <span className="font-bold uppercase text-gold-primary">{details.plan}</span>
          </div>
          <div className="h-px bg-gold-primary/20 my-2" />
          <div className="flex justify-between items-end">
            <span className="text-text-muted">Total (Setup Fee)</span>
            <span className="font-rajdhani font-black text-2xl">₹{details.amount}</span>
          </div>
        </div>

        {error && <div className="text-red-500 text-xs mb-4 text-center">{error}</div>}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-gold-primary text-black font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Pay via Razorpay'}
        </button>
      </div>
    </div>
  );
}
