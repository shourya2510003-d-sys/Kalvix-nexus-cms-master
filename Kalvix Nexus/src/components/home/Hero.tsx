'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Globe, Zap, Users } from 'lucide-react';
import dynamic from 'next/dynamic';

const DashboardVisual = dynamic(
  () => import('@/components/DashboardVisual'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] lg:h-[500px] rounded-2xl bg-bg-card border border-white/10 animate-pulse" />
    ),
  }
);

export default function Hero({ heroData }: { heroData: any }) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-20 overflow-hidden bg-bg-primary">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-gold-primary/20 rounded-full blur-[64px] transform-gpu"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
          className="absolute top-1/3 -right-1/4 w-[600px] h-[600px] bg-gold-light/20 rounded-full blur-[64px] transform-gpu"
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* LEFT CONTENT - EXACT OLD TEXT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-primary/10 border border-gold-primary/20 text-gold-primary text-xs font-semibold tracking-wide uppercase mb-6">
              <SparklesIcon /> Premium Tech & Marketing Agency
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-outfit text-text-primary leading-[1.1] mb-6 tracking-tight">
              Transform Your Business Through Technology, AI & Digital Growth.
            </h1>
            
            <p className="text-base md:text-lg text-text-muted leading-relaxed mb-6 max-w-lg">
              {heroData?.heroSubtitle || "Kalvix Nexus helps startups, businesses, NGOs, educational institutions, and enterprises build scalable digital ecosystems through web development, app development, AI solutions, SEO, digital marketing, and intelligent automation."}
            </p>

            <p className="text-sm md:text-base text-text-primary font-medium mb-8 max-w-lg">
              From concept to execution, we deliver future-ready digital solutions that drive growth, improve efficiency, and create measurable business impact.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/contact" className="w-full sm:w-auto px-8 py-4 bg-text-primary text-bg-primary rounded font-semibold hover:bg-gold-primary hover:text-text-primary transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:-translate-y-1">
                Book Free Consultation <ArrowRight size={18} />
              </Link>
              <Link href="/services" className="w-full sm:w-auto px-8 py-4 bg-bg-primary text-text-primary border border-border rounded font-semibold hover:bg-bg-surface transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1">
                Explore Our Services
              </Link>
            </div>
          </motion.div>

          {/* RIGHT VISUAL - 3D DASHBOARD */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative flex justify-center items-center w-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px]"
          >
            {/* Mobile Image Fallback */}
            <img 
              src="/dashboard-mobile.png" 
              alt="Dashboard Visual" 
              className="block md:hidden w-full max-w-[350px] mx-auto rounded-xl shadow-2xl border border-white/10 object-contain"
            />
            {/* Desktop Interactive 3D Visual */}
            <div className="hidden md:block w-full">
              <DashboardVisual />
            </div>
          </motion.div>
        </div>

        {/* 4 Trust Indicators at the bottom */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-20 pt-8 border-t border-border w-full flex flex-wrap justify-center md:justify-between gap-8"
        >
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
            <Zap className="text-gold-primary" size={18} /> AI-Powered Solutions
          </div>
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
            <Globe className="text-gold-primary" size={18} /> Global Client Support
          </div>
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
            <ShieldCheck className="text-gold-primary" size={18} /> End-to-End Execution
          </div>
          <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
            <Users className="text-gold-primary" size={18} /> Long-Term Partnership
          </div>
        </motion.div>

      </div>
    </section>
  );
}

function SparklesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor" />
    </svg>
  );
}
