'use client';

import React, { useState, useEffect } from 'react';
import { Check, Sparkles, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function PricingPage() {
  const [pricing, setPricing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pricingRef = ref(db, 'pricing');
    onValue(pricingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedPricing = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setPricing(loadedPricing);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute top-10 left-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-10 right-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-15" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        <div className="text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-rajdhani text-xs font-bold tracking-[0.4em] text-gold-primary uppercase">Pricing Plans</span>
            <h1 className="font-orbitron font-black text-3xl sm:text-5xl text-text-primary mt-2 mb-4 uppercase tracking-wider">
              Investment Options
            </h1>
            <p className="text-text-muted text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Transparent, ROI-centered pricing tiers designed to fit early-stage startups as well as established market players.
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-gold-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {pricing.map((tier, idx) => {
              const features = Array.isArray(tier.features) ? tier.features : (tier.features ? tier.features.split(',') : []);
              
              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className={`bg-bg-card border rounded-xl p-8 flex flex-col justify-between relative group ${
                    tier.popular 
                      ? 'border-gold-primary shadow-[0_0_25px_rgba(212,160,23,0.15)] md:scale-105 z-10' 
                      : 'border-gold-primary/10 hover:border-gold-primary/30'
                  } transition-all duration-300`}
                >
                  {tier.popular && (
                    <span className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 bg-gold-primary text-black font-rajdhani font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-gold-glow">
                      <Sparkles size={10} />
                      <span>Most Popular</span>
                    </span>
                  )}

                  <div>
                    <h3 className="font-orbitron font-black text-sm text-text-primary tracking-widest uppercase mb-1">
                      {tier.name}
                    </h3>
                    <p className="text-text-muted text-[11px] leading-relaxed mb-6 h-10">
                      {tier.desc}
                    </p>

                    <div className="flex items-baseline gap-1 mb-8 border-b border-gold-primary/10 pb-6">
                      <span className="font-orbitron font-black text-2xl sm:text-3xl text-gold-primary">
                        {tier.price}
                      </span>
                      <span className="text-text-muted text-xs font-mono">
                        {tier.period}
                      </span>
                    </div>

                    <ul className="space-y-4 text-xs text-text-muted mb-8">
                      {features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check size={14} className="text-gold-primary mt-0.5 flex-shrink-0" />
                          <span className="text-[11px] leading-relaxed">{f.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={`https://wa.me/917906355122?text=Hi%20Kalvix%20Nexus%2C%20I%27m%2520interested%20in%20your%20${encodeURIComponent(tier.name)}%20pricing%20tier.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 rounded-lg font-rajdhani font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                      tier.popular
                        ? 'bg-gold-primary text-black shadow-gold-glow hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-bg-primary text-gold-primary border border-gold-primary/20 hover:border-gold-primary hover:bg-gold-primary/5'
                    } shimmer-btn`}
                  >
                    <MessageSquare size={13} />
                    <span>{tier.cta || 'Start Tier'}</span>
                  </a>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}