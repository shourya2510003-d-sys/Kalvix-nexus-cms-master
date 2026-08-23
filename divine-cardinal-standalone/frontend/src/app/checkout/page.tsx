'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { db, ref, set, get } from '../../lib/firebase';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const { currency, exchangeRate } = useCurrency();

  // Address State
  const [address, setAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // General Checkout status
  const [shippingCost, setShippingCost] = useState(0); // free shipping
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('RAZORPAY');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Update shipping based on country
  useEffect(() => {
    if (address.country.toLowerCase() === 'india' || address.country.toLowerCase() === 'in') {
      setShippingCost(0); // India: 99 cut, Free
    } else {
      setShippingCost(99); // International: 599 cut, 99
    }
  }, [address.country]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    
    try {
      const codeId = couponCode.toUpperCase().replace(/\s+/g, '');
      const discountSnapshot = await get(ref(db, `discounts/${codeId}`));
      
      if (discountSnapshot.exists()) {
        const discountData = discountSnapshot.val();
        
        if (!discountData.active) {
          setErrorMsg('This coupon is no longer active.');
          return;
        }

        if (discountData.minSpend && cartTotal < discountData.minSpend) {
          setErrorMsg(`Minimum spend of ${formatDual(discountData.minSpend)} required for this coupon.`);
          return;
        }

        let amountToDeduct = 0;
        if (discountData.type === 'percentage') {
          amountToDeduct = cartTotal * (discountData.value / 100);
        } else {
          // fixed
          amountToDeduct = discountData.value;
        }

        setAppliedCoupon(codeId);
        setDiscountAmount(amountToDeduct);
        setErrorMsg(null);
      } else {
        // Fallback for hardcoded
        if (codeId === 'WELCOME10') {
          setAppliedCoupon('WELCOME10');
          setDiscountAmount(cartTotal * 0.1);
          setErrorMsg(null);
        } else {
          setErrorMsg('Invalid coupon code.');
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error validating coupon. Please try again.');
    }
  };

  const finalTotal = cartTotal + shippingCost - discountAmount;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    // Validate compulsory fields
    if (!address.email || !address.email.includes('@')) {
      setErrorMsg('A valid email address is required for order confirmation.');
      return;
    }
    if (!address.phone || address.phone.length < 10) {
      setErrorMsg('A valid phone/WhatsApp number is required for order updates.');
      return;
    }

    setIsPlacingOrder(true);
    setErrorMsg(null);

    let counterVal = Date.now().toString().slice(-6); // fallback
    try {
      const counterRef = ref(db, 'globals/orderCounter');
      const counterSnap = await get(counterRef);
      if (counterSnap && !isNaN(parseInt(counterSnap))) {
        // Increment existing counter
        counterVal = (parseInt(counterSnap) + 1).toString();
      } else {
        // Start from 1001 if no counter exists
        counterVal = '1001';
      }
      // Save new counter back
      await set(counterRef, counterVal);
    } catch (e) {
      console.error('Error fetching order sequence, using fallback', e);
    }
    
    // Safety check just in case
    if (isNaN(parseInt(counterVal))) counterVal = '1001';

    const orderNum = `DCWS-${counterVal}`;
    const normalizedOrderNum = orderNum.replace('-', '_');
    const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const newFirebaseOrder = {
      id: orderNum,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' at ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      customer: `${address.firstName} ${address.lastName}`.trim() || 'Guest Customer',
      total: finalTotal,
      paymentStatus: paymentMethod === 'COD' ? 'Unpaid (COD)' : 'Pending',
      fulfillmentStatus: 'Unfulfilled',
      deliveryStatus: 'Processing',
      items: `${itemsCount} item${itemsCount > 1 ? 's' : ''}`,
      cartItems: cart
    };

    try {
      // 1. If COD, directly save and finish
      if (paymentMethod === 'COD') {
        await saveOrderToFirebase(normalizedOrderNum, newFirebaseOrder);
        return;
      }

      // 2. If Razorpay, initialize checkout
      const res = await fetch('/api/razorpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal, receipt: normalizedOrderNum, currency: 'INR' })
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create Razorpay Order');
      }

      // Load Razorpay Script
      const resScript = await loadRazorpayScript();
      if (!resScript) throw new Error('Razorpay SDK failed to load. Check your connection.');

      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Divine Cardinal",
        description: "Ayurvedic Wellness Products",
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response)
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              await saveOrderToFirebase(normalizedOrderNum, { ...newFirebaseOrder, paymentStatus: 'Paid (Razorpay)' });
            } else {
              setErrorMsg('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            setErrorMsg('Payment verification failed.');
          }
        },
        prefill: {
          name: `${address.firstName} ${address.lastName}`.trim(),
          email: user?.email || '',
          contact: address.phone
        },
        theme: { color: "#008060" }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        setErrorMsg('Payment Failed: ' + response.error.description);
      });
      rzp1.open();
    } catch (err: any) {
      console.error("Order placement failed:", err);
      setErrorMsg(err.message || 'Failed to process order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const saveOrderToFirebase = async (normalizedOrderNum: string, newFirebaseOrder: any) => {
    try {
      // 1. Generate AWB from Delhivery
      let updatedOrder = { ...newFirebaseOrder };
      try {
        const shippingRes = await fetch('/api/shipping/delhivery/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: normalizedOrderNum,
            address: address,
            cart: cart,
            finalTotal: finalTotal
          })
        });
        const shippingData = await shippingRes.json();
        if (shippingData.success && shippingData.waybill) {
          updatedOrder.trackingNumber = shippingData.waybill;
          updatedOrder.trackingUrl = `https://www.delhivery.com/track/package/${shippingData.waybill}`;
        }
      } catch (e) {
        console.error('Delhivery integration error', e);
      }

      await set(ref(db, `orders/${normalizedOrderNum}`), updatedOrder);
      
      try {
        const makeSnapshot = await get(ref(db, 'integrations/make'));
        if (makeSnapshot.exists()) {
          const makeConfig = makeSnapshot.val();
          if (makeConfig.enabled && makeConfig.webhookUrl) {
            await fetch(makeConfig.webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...updatedOrder,
                address: address,
                cart: cart,
                coupon: appliedCoupon
              })
            });
          }
        }
      } catch (webhookErr) {
        console.error('Webhook failed:', webhookErr);
      }
      
      // 3. Post-Checkout Triggers (WhatsApp & Email)
      try {
        await fetch('/api/orders/triggers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: updatedOrder,
            address: address
          })
        });
      } catch (triggerErr) {
        console.error('Post-checkout triggers failed:', triggerErr);
      }
      
      setOrderSuccess(updatedOrder.id);
      clearCart();
    } catch (e: any) {
      setErrorMsg('Failed to save order to database.');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const formatDual = (amount: number) => {
    if (currency === 'INR') return `Rs. ${amount.toFixed(2)}`;
    return `Rs. ${amount.toFixed(2)} (${currency} ${(amount * exchangeRate).toFixed(2)})`;
  };

  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <CheckCircle className="h-16 w-16 text-luxury-emerald mx-auto" />
        <h1 className="font-serif text-3xl text-luxury-charcoal">Order Placed Successfully!</h1>
        <p className="text-sm font-sans font-light text-luxury-charcoal/70">
          Thank you for your purchase. Your order number is <strong className="text-luxury-gold">{orderSuccess}</strong>.
        </p>
        <p className="text-xs text-luxury-charcoal/50">
          A confirmation email has been sent, and you can download your invoice inside your profile dashboard.
        </p>
        <div className="pt-6">
          <Link
            href="/"
            className="inline-block bg-luxury-gold text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-luxury-goldDark transition-colors font-serif"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-serif text-3xl text-luxury-charcoal mb-8 border-b border-luxury-gold/15 pb-4">Secure Checkout</h1>

      {cart.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="font-serif text-lg">Your bag is empty.</p>
          <Link href="/shop" className="underline text-sm text-luxury-gold font-serif">Go to Shop</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Shipping Form (Left - 7 cols) */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8 bg-white border border-luxury-gold/15 p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif text-lg text-luxury-gold border-b border-luxury-gold/10 pb-2">Shipping Information</h2>
            
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs rounded flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">First Name</label>
                <input
                  type="text"
                  required
                  value={address.firstName}
                  onChange={(e) => setAddress((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="w-full border border-luxury-gold/30 rounded p-2 text-sm outline-none focus:border-luxury-gold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">Last Name</label>
                <input
                  type="text"
                  required
                  value={address.lastName}
                  onChange={(e) => setAddress((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="w-full border border-luxury-gold/30 rounded p-2 text-sm outline-none focus:border-luxury-gold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">Address Line 1</label>
              <input
                type="text"
                required
                placeholder="House no., street name, area"
                value={address.addressLine1}
                onChange={(e) => setAddress((prev) => ({ ...prev, addressLine1: e.target.value }))}
                className="w-full border border-luxury-gold/30 rounded p-2 text-sm outline-none focus:border-luxury-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">Address Line 2 (Optional)</label>
              <input
                type="text"
                placeholder="Apartment, landmark, etc."
                value={address.addressLine2}
                onChange={(e) => setAddress((prev) => ({ ...prev, addressLine2: e.target.value }))}
                className="w-full border border-luxury-gold/30 rounded p-2 text-sm outline-none focus:border-luxury-gold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">Country</label>
                <input
                  type="text"
                  required
                  value={address.country}
                  onChange={(e) => setAddress((prev) => ({ ...prev, country: e.target.value }))}
                  className="w-full border border-luxury-gold/30 rounded p-2 text-sm outline-none focus:border-luxury-gold"
                />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">Postal Code</label>
                <input
                  type="text"
                  required
                  value={address.postalCode}
                  onChange={(e) => setAddress((prev) => ({ ...prev, postalCode: e.target.value }))}
                  className="w-full border border-luxury-gold/30 rounded p-2 text-sm outline-none focus:border-luxury-gold"
                />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">City</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full border border-luxury-gold/30 rounded p-2 text-sm outline-none focus:border-luxury-gold"
                />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">State</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
                  className="w-full border border-luxury-gold/30 rounded p-2 text-sm outline-none focus:border-luxury-gold"
                />
              </div>
            </div>

            <div className="space-y-1 mt-4">
              <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">Email Address (For Order Updates) *</label>
              <input 
                type="email" 
                required
                placeholder="your@email.com" 
                className="w-full border border-luxury-gold/30 rounded p-2 text-sm outline-none focus:border-luxury-gold"
                value={address.email}
                onChange={(e) => setAddress((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-1 mt-4">
              <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">WhatsApp / Phone Number *</label>
              <input 
                type="tel" 
                required
                placeholder="Mobile number"
                className="w-full border border-luxury-gold/30 rounded p-2 text-sm outline-none focus:border-luxury-gold"
                value={address.phone}
                onChange={(e) => setAddress((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-4 pt-4 border-t border-luxury-gold/10">
              <h3 className="font-serif text-lg text-luxury-gold">Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className={`border p-4 rounded flex flex-col items-center justify-center space-y-2 cursor-pointer transition-colors ${
                  paymentMethod === 'COD' ? 'border-luxury-gold bg-luxury-gold/5' : 'border-luxury-gold/20'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="sr-only"
                  />
                  <span className="font-serif text-sm">Cash on Delivery</span>
                  <span className="text-[10px] text-luxury-charcoal/60 text-center">Pay with cash at door</span>
                </label>



                <label className={`border p-4 rounded flex flex-col items-center justify-center space-y-2 cursor-pointer transition-colors ${
                  paymentMethod === 'RAZORPAY' ? 'border-luxury-gold bg-luxury-gold/5' : 'border-luxury-gold/20'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="sr-only"
                  />
                  <span className="font-serif text-sm">UPI & NetBanking</span>
                  <span className="text-[10px] text-luxury-charcoal/60 text-center">Secure pay via Razorpay</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPlacingOrder}
              className="w-full bg-luxury-gold hover:bg-luxury-goldDark text-white py-4 text-xs uppercase tracking-widest font-serif transition-colors disabled:opacity-50"
            >
              {isPlacingOrder ? 'Processing...' : `Place Secure Order - ${formatDual(finalTotal)}`}
            </button>
          </form>

          {/* Order Summary (Right - 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-luxury-cream border border-luxury-gold/15 p-6 shadow-sm space-y-6">
              <h2 className="font-serif text-lg text-luxury-charcoal border-b border-luxury-gold/10 pb-2">Bag Summary</h2>
              
              {/* Items List */}
              <div className="divide-y divide-luxury-gold/10 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                {cart.map((item) => (
                  <div key={item.variantId} className="py-4 flex justify-between items-center text-sm">
                    <div>
                      <h4 className="font-serif">{item.name}</h4>
                      <p className="text-[10px] text-luxury-gold uppercase">{item.variantTitle} &times; {item.quantity}</p>
                    </div>
                    <span className="font-serif">{formatDual(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex border-t border-b border-luxury-gold/10 py-4">
                <input
                  type="text"
                  placeholder="Enter Promo Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-transparent border border-luxury-gold/20 rounded-l px-3 py-2 text-xs w-full focus:outline-none focus:border-luxury-gold"
                />
                <button
                  type="submit"
                  className="bg-luxury-gold hover:bg-luxury-goldDark text-white px-4 rounded-r text-xs uppercase tracking-widest font-serif transition-colors"
                >
                  Apply
                </button>
              </form>

              {/* Pricing breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-luxury-charcoal/80 font-light">
                  <span>Subtotal</span>
                  <span>{formatDual(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-luxury-charcoal/80 font-light items-center">
                  <span>Shipping Cost</span>
                  <div className="text-right">
                    {shippingCost === 0 ? (
                      <>
                        <span className="text-gray-400 line-through text-[10px] mr-2">₹99</span>
                        <span className="text-luxury-emerald font-medium uppercase text-xs tracking-widest">Free</span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400 line-through text-[10px] mr-2">₹599</span>
                        <span className="text-luxury-emerald font-medium uppercase text-xs tracking-widest">{formatDual(shippingCost)}</span>
                      </>
                    )}
                  </div>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-luxury-emerald font-light">
                    <span>Discount ({appliedCoupon})</span>
                    <span>- {formatDual(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-luxury-gold/15 pt-4 text-base font-serif font-medium">
                  <span>Final Total</span>
                  <span>{formatDual(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
