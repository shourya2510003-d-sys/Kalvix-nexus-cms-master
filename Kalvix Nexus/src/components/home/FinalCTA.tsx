'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden bg-bg-card text-text-primary">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-4xl md:text-6xl font-outfit font-bold mb-6 tracking-tight">
            Let's Build Something <span className="text-gold-primary">Extraordinary</span> Together.
          </h2>
          <p className="text-lg md:text-xl text-text-muted/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Whether you need a website, mobile application, AI solution, marketing strategy, or automation system, Kalvix Nexus is ready to help.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact" className="px-8 py-4 bg-gold-primary text-text-primary rounded font-bold hover:bg-gold-light transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:-translate-y-1">
              Book Consultation <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-transparent border border-border/30 rounded font-semibold text-text-primary hover:bg-text-primary/5 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1">
              Contact Us <Mail size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
