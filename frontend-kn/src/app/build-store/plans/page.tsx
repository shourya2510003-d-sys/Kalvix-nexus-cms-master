'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 999,
    features: ['Responsive Website', 'Up to 50 Products', 'Standard Support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2499,
    features: ['Responsive Website', 'Unlimited Products', 'Priority Support', 'Custom Domain'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 4999,
    features: ['Everything in Pro', 'Dedicated Account Manager', 'Custom App Development'],
  }
];

export default function PlansPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    const name = sessionStorage.getItem('pendingStoreName');
    if (!name) {
      router.push('/build-store');
    } else {
      setStoreName(name);
    }
  }, [router]);

  const selectPlan = (planId: string, amount: number) => {
    sessionStorage.setItem('selectedPlan', planId);
    sessionStorage.setItem('planAmount', amount.toString());
    router.push('/build-store/themes');
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-orbitron font-black text-3xl md:text-4xl uppercase tracking-wider mb-4">
            Select Your Plan
          </h1>
          <p className="text-text-muted text-sm max-w-xl mx-auto">
            You're one step away from launching <strong className="text-gold-primary">{storeName}</strong>. Choose the engine that powers your digital growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, idx) => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-bg-card border ${plan.popular ? 'border-gold-primary shadow-gold-glow' : 'border-gold-primary/20'} rounded-2xl p-8 flex flex-col relative`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold-primary text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              
              <h3 className="font-orbitron font-bold text-xl uppercase mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-3xl font-black font-rajdhani text-gold-light">₹{plan.price}</span>
                <span className="text-text-muted text-xs"> / setup</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-text-muted">
                    <CheckCircle2 size={16} className="text-gold-primary mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => selectPlan(plan.id, plan.price)}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                  plan.popular 
                    ? 'bg-gold-primary text-black hover:bg-gold-light' 
                    : 'bg-gold-primary/10 text-gold-primary border border-gold-primary/30 hover:bg-gold-primary/20'
                }`}
              >
                Choose {plan.name} <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
