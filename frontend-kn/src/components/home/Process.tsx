'use client';

import React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    title: "Discovery & Strategy",
    desc: "Understand goals, challenges, audience, and opportunities.",
    number: "01"
  },
  {
    title: "Planning & Architecture",
    desc: "Create the roadmap and execution strategy.",
    number: "02"
  },
  {
    title: "Development & Execution",
    desc: "Build, optimize, and deploy solutions.",
    number: "03"
  },
  {
    title: "Testing & Optimization",
    desc: "Ensure quality, speed, security, and usability.",
    number: "04"
  },
  {
    title: "Launch & Growth",
    desc: "Monitor performance and continuously improve.",
    number: "05"
  }
];

export default function Process() {
  return (
    <section className="py-24 bg-bg-primary text-text-primary relative overflow-hidden">
      {/* Decorative Gold Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-20" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-lg md:text-xl font-bold text-gold-primary tracking-widest uppercase mb-4">Our Methodology</h2>
            <h3 className="text-3xl md:text-5xl font-outfit font-bold leading-tight mb-6">
              How We Work.
            </h3>
          </motion.div>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-10 right-10 h-0.5 bg-border/20 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
            {STEPS.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative"
              >
                <div className="w-16 h-16 rounded-full bg-bg-surface text-text-primary flex items-center justify-center font-outfit font-bold text-xl border-2 border-gold-primary/30 shadow-md mb-6 mx-auto md:mx-0 group-hover:bg-gold-primary group-hover:text-black transition-colors duration-300">
                  {step.number}
                </div>
                <div className="text-center md:text-left">
                  <h4 className="text-lg font-outfit font-bold mb-2">{step.title}</h4>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
