'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function WhoWeAre() {
  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-lg md:text-xl font-bold text-gold-primary tracking-widest uppercase mb-4">
            Who We Are
          </h2>
          <h3 className="text-3xl md:text-5xl font-outfit font-bold text-white mb-8 leading-tight drop-shadow-md">
            Technology Meets Strategy.
          </h3>
          <p className="text-base md:text-lg text-white/80 leading-relaxed mb-8 drop-shadow">
            Kalvix Nexus is an AI-powered full-service technology and marketing agency helping organizations build, scale, and transform through innovation.
          </p>
          <p className="text-sm md:text-base text-white/90 leading-relaxed p-6 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 shadow-xl">
            <strong className="text-gold-primary">Our Mission:</strong> Bridge the gap between technology and business growth by delivering intelligent digital solutions tailored to each client's goals. We combine development, marketing, automation, and AI expertise to create systems that generate long-term value.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
