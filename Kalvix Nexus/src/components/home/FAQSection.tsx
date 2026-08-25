'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    q: "What services does Kalvix Nexus provide?",
    a: "We are a full-service technology and marketing agency. Our core services include Custom Web Development, Mobile App Development, AI Solutions & Automation, SEO Services, and Digital Marketing."
  },
  {
    q: "How much does a custom website cost?",
    a: "Pricing depends on the complexity, features, and scale of the project. We provide custom quotes after a free discovery consultation where we understand your specific business requirements."
  },
  {
    q: "Do you work with international clients?",
    a: "Yes, we serve a global client base, with a strong presence in the United States, United Kingdom, UAE, and India. Our processes are designed for seamless remote collaboration."
  },
  {
    q: "How long does a typical project take?",
    a: "A standard corporate website can take 1-2 weeks, while complex web applications or mobile apps may take 15 to 30 days. Timelines are clearly defined during the architecture phase."
  },
  {
    q: "What makes Kalvix Nexus different from other agencies?",
    a: "We are an AI-first agency. We don't just build software; we engineer intelligent systems that automate operations, optimize for search engines, and directly drive business growth. Our approach combines enterprise-grade engineering with luxury design standards."
  }
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-24 bg-bg-card relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-lg md:text-xl font-bold text-gold-primary tracking-widest uppercase mb-4">FAQ</h2>
            <h3 className="text-3xl md:text-5xl font-outfit font-bold text-text-primary leading-tight">
              Frequently Asked Questions.
            </h3>
          </motion.div>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`border rounded-xl overflow-hidden transition-colors duration-300 ${isOpen ? 'border-gold-primary bg-bg-primary shadow-sm' : 'border-border bg-bg-card'}`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className={`font-outfit font-bold text-lg ${isOpen ? 'text-gold-primary' : 'text-text-primary'}`}>
                    {faq.q}
                  </span>
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-gold-primary/10 text-gold-primary' : 'bg-bg-surface text-text-muted'}`}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-text-muted leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
