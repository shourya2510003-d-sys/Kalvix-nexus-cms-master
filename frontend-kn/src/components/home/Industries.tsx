'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, HeartPulse, Building2, Rocket, ShoppingCart, Factory, Briefcase, Coffee } from 'lucide-react';

const INDUSTRIES = [
  { name: "Education", icon: GraduationCap },
  { name: "Healthcare", icon: HeartPulse },
  { name: "NGOs", icon: Building2 },
  { name: "Startups", icon: Rocket },
  { name: "Ecommerce", icon: ShoppingCart },
  { name: "Manufacturing", icon: Factory },
  { name: "Professional Services", icon: Briefcase },
  { name: "Hospitality", icon: Coffee }
];

export default function Industries() {
  return (
    <section className="py-24 bg-bg-primary relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-lg md:text-xl font-bold text-gold-primary tracking-widest uppercase mb-4">Industries We Serve</h2>
            <h3 className="text-3xl md:text-5xl font-outfit font-bold text-text-primary leading-tight">
              Specialized Domain Expertise.
            </h3>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {INDUSTRIES.map((ind, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-bg-card border border-border rounded-xl p-6 md:p-8 flex flex-col items-center justify-center text-center group hover:bg-gold-primary transition-colors duration-300 cursor-default shadow-sm"
            >
              <ind.icon className="text-text-muted mb-4 group-hover:text-bg-primary transition-colors" size={32} />
              <h4 className="font-outfit font-bold text-text-primary group-hover:text-bg-primary transition-colors">{ind.name}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
