'use client';

import React from 'react';
import { ShieldCheck, FileText, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="bg-bg-primary min-h-screen py-20 px-6 max-w-4xl mx-auto relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-10 left-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-10 right-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-15" />

      <div className="relative z-10 space-y-8">
        <div>
          <span className="font-rajdhani text-xs font-bold tracking-[0.4em] text-gold-primary uppercase">Workspace</span>
          <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-text-primary uppercase tracking-wider mt-1">
            Client Dashboard
          </h1>
          <p className="text-text-muted text-xs mt-1">
            Track your campaign statuses, invoices, and shared digital assets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-card border border-gold-primary/10 p-6 rounded-xl hover:border-gold-primary/20 transition-all">
            <div className="w-8 h-8 rounded-full bg-gold-primary/5 border border-gold-primary/20 flex items-center justify-center mb-4">
              <CheckCircle size={16} className="text-gold-primary" />
            </div>
            <h4 className="font-orbitron font-bold text-text-primary uppercase text-xs mb-2">Campaign Status</h4>
            <p className="text-emerald-400 font-mono text-[11px] font-bold">Status: Active Campaigns Deployed</p>
          </div>

          <div className="bg-bg-card border border-gold-primary/10 p-6 rounded-xl hover:border-gold-primary/20 transition-all">
            <div className="w-8 h-8 rounded-full bg-gold-primary/5 border border-gold-primary/20 flex items-center justify-center mb-4">
              <FileText size={16} className="text-gold-primary" />
            </div>
            <h4 className="font-orbitron font-bold text-text-primary uppercase text-xs mb-2">Active Invoices</h4>
            <p className="text-text-muted font-mono text-[11px]">0 Pending Invoice Balance</p>
          </div>

          <div className="bg-bg-card border border-gold-primary/10 p-6 rounded-xl hover:border-gold-primary/20 transition-all">
            <div className="w-8 h-8 rounded-full bg-gold-primary/5 border border-gold-primary/20 flex items-center justify-center mb-4">
              <ShieldCheck size={16} className="text-gold-primary" />
            </div>
            <h4 className="font-orbitron font-bold text-text-primary uppercase text-xs mb-2">Shared Asset Files</h4>
            <p className="text-text-muted font-mono text-[11px]">No new assets uploaded.</p>
          </div>
        </div>
      </div>
    </div>
  );
}