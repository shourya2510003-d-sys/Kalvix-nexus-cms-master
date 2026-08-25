'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Settings, Target, MessageSquare, Maximize, Shield } from 'lucide-react';

const REASONS = [
  {
    title: "AI-First Approach",
    desc: "We embed artificial intelligence into our workflows and the products we build to ensure you stay ahead of the curve.",
    icon: Cpu
  },
  {
    title: "Custom-Built Solutions",
    desc: "No templated strategies. Every line of code and marketing campaign is tailored to your unique business model.",
    icon: Settings
  },
  {
    title: "Growth-Focused Execution",
    desc: "We prioritize measurable outcomes—more traffic, higher conversions, and scalable revenue streams.",
    icon: Target
  },
  {
    title: "Transparent Communication",
    desc: "Direct access to our engineering and strategy teams. Complete clarity on timelines, costs, and deliverables.",
    icon: MessageSquare
  },
  {
    title: "Scalable Technology",
    desc: "Infrastructure designed to handle your growth, from MVP to enterprise-level user loads without breaking.",
    icon: Maximize
  },
  {
    title: "Long-Term Partnership",
    desc: "We don't just launch and leave. We act as your ongoing technical and growth partners to ensure sustained success.",
    icon: Shield
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-transparent text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-lg md:text-xl font-bold text-gold-primary tracking-widest uppercase mb-4">Our Advantage</h2>
            <h3 className="text-3xl md:text-5xl font-outfit font-bold leading-tight mb-6">
              Why Businesses Trust Kalvix Nexus.
            </h3>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REASONS.map((reason, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex gap-4 group cursor-default bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center group-hover:bg-gold-primary/20 transition-colors duration-300">
                <reason.icon size={20} className="text-gold-primary transition-colors" />
              </div>
              <div>
                <h4 className="text-lg font-outfit font-bold text-white mb-2 group-hover:text-gold-primary transition-colors">{reason.title}</h4>
                <p className="text-sm text-white/80 leading-relaxed">
                  {reason.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
