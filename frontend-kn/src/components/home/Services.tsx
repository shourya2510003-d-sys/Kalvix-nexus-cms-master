'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Code2, Smartphone, Cpu, Search, TrendingUp, Zap, ArrowRight, Briefcase } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function Services() {
  const [servicesData, setServicesData] = useState<any[]>([]);

  useEffect(() => {
    const servicesRef = ref(db, 'services');
    const unsubscribe = onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setServicesData(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="py-24 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-lg md:text-xl font-bold text-gold-primary tracking-widest uppercase mb-4">Our Expertise</h2>
            <h3 className="text-3xl md:text-5xl font-outfit font-bold text-white leading-tight mb-6 drop-shadow-md">
              Solutions Designed For Growth.
            </h3>
            <p className="text-white/80 text-base drop-shadow">
              Comprehensive digital engineering and strategic marketing services to scale your enterprise.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesData.map((srv, idx) => (
            <motion.div
              key={srv.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group bg-black/40 backdrop-blur-sm border border-white/10 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-primary/10 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />
              
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gold-primary/20 group-hover:border-gold-primary/50 transition-colors overflow-hidden">
                {srv.image ? (
                  <img src={srv.image} alt={srv.title} className="w-full h-full object-cover" />
                ) : (
                  <Briefcase className="text-white group-hover:text-gold-primary transition-colors" size={24} />
                )}
              </div>
              
              <h4 className="font-outfit font-bold text-xl text-white mb-3 drop-shadow-md">{srv.title}</h4>
              <p className="text-white/70 text-sm leading-relaxed mb-8 drop-shadow">
                {srv.desc}
              </p>
              
              <Link href={srv.link || '#'} className="inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:text-gold-primary transition-colors">
                Learn More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
