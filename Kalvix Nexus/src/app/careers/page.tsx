'use client';

import React from 'react';
import { Briefcase } from 'lucide-react';

export default function CareersPage() {
  return (
    <div className="bg-bg-primary min-h-screen py-20 px-6 max-w-2xl mx-auto text-center relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-10 left-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-10 right-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-15" />

      <div className="relative z-10">
        <span className="font-rajdhani text-xs font-bold tracking-[0.4em] text-gold-primary uppercase">Careers</span>
        <h1 className="font-orbitron font-black text-3xl sm:text-5xl text-text-primary uppercase tracking-wider mt-1 mb-4">
          Join Our Team
        </h1>
        <p className="font-rajdhani text-gold-primary text-xs uppercase tracking-[0.2em] mb-12">
          Building the Future of Tech & Digital Marketing
        </p>

        <div className="bg-bg-card border border-gold-primary/10 p-8 rounded-xl hover:border-gold-primary/20 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-gold-primary/5 border border-gold-primary/20 flex items-center justify-center mx-auto mb-4">
            <Briefcase size={18} className="text-gold-primary" />
          </div>
          <h3 className="font-orbitron font-bold text-base text-text-primary mb-3 uppercase tracking-wider">
            No Open Positions Right Now
          </h3>
          <p className="text-text-muted text-xs leading-relaxed max-w-md mx-auto">
            Our team is currently operating at full capacity. However, we are always on the lookout for talented engineers, performance marketers, and designers. Feel free to send your resume directly to our email: <a href="mailto:kalvixnexus@gmail.com" className="text-gold-primary hover:underline font-mono">kalvixnexus@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}