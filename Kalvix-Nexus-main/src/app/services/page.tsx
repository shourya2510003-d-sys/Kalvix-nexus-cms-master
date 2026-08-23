'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Search, Share2, Award, TrendingUp, Eye, Code, Smartphone, ShoppingBag, Cpu, ArrowRight } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const CATEGORIES = [
  { id: 'all', label: 'All Services' },
  { id: 'marketing', label: 'Digital Marketing' },
  { id: 'branding', label: 'Branding & Creative' },
  { id: 'tech', label: 'Technology' },
];

const ICONS_MAP: any = {
  Megaphone, Search, Share2, Award, TrendingUp, Eye, Code, Smartphone, ShoppingBag, Cpu
};

export default function ServicesPage() {
  const [filter, setFilter] = useState('all');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const servicesRef = ref(db, 'services');
    onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedServices = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setServices(loadedServices);
      }
      setLoading(false);
    });
  }, []);

  const filteredServices = filter === 'all' 
    ? services 
    : services.filter(s => s.category === filter);

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute top-10 left-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-10 right-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-15" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        <div className="text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-rajdhani text-xs font-bold tracking-[0.4em] text-gold-primary uppercase">Our Capabilities</span>
            <h1 className="font-orbitron font-black text-3xl sm:text-5xl text-text-primary mt-2 mb-4 uppercase tracking-wider">
              Services Engine
            </h1>
            <p className="text-text-muted text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              We engineer technical assets and run performance-driven marketing campaigns to accelerate brand growth.
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-3 items-center justify-center mt-10 max-w-2xl mx-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-5 py-2 font-rajdhani font-bold text-xs uppercase tracking-widest border rounded-full transition-all duration-300 ${
                  filter === cat.id
                    ? 'bg-gold-primary text-black border-gold-primary shadow-gold-glow scale-105'
                    : 'bg-bg-card text-text-muted border-gold-primary/20 hover:border-gold-primary/55'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-gold-primary animate-spin" />
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredServices.map(srv => {
                const IconComp = ICONS_MAP[srv.icon] || Code;
                const deliverables = Array.isArray(srv.deliverables) ? srv.deliverables : (srv.deliverables ? srv.deliverables.split(',') : []);

                return (
                  <motion.div
                    layout
                    key={srv.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-bg-card border border-gold-primary/10 p-8 rounded-xl flex flex-col justify-between hover:border-gold-primary/30 hover:shadow-gold-glow transition-all duration-300 relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-lg bg-gold-primary/5 border border-gold-primary/25 flex items-center justify-center group-hover:bg-gold-primary group-hover:text-black transition-all duration-300">
                          <IconComp size={22} className="text-gold-primary group-hover:text-black transition-colors" />
                        </div>
                        <span className="text-[9px] font-rajdhani font-black text-gold-primary uppercase tracking-[0.2em] px-2.5 py-1 bg-gold-primary/5 border border-gold-primary/10 rounded-full">
                          {srv.category || 'Service'}
                        </span>
                      </div>

                      <h2 className="font-orbitron font-bold text-lg text-text-primary mb-3 group-hover:text-gold-primary transition-colors">
                        {srv.title}
                      </h2>
                      
                      <p className="text-text-muted text-xs leading-relaxed mb-6">
                        {srv.desc}
                      </p>

                      {deliverables.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-[10px] font-orbitron font-black text-text-primary uppercase tracking-wider mb-2">Key Deliverables:</h4>
                          <ul className="space-y-1">
                            {deliverables.map((del: string, dIdx: number) => (
                              <li key={dIdx} className="flex items-center gap-2 text-xs text-text-muted">
                                <span className="w-1 h-1 rounded-full bg-gold-primary" />
                                <span>{del.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {srv.tools && (
                        <div className="text-[10px] font-mono text-text-muted mb-6 bg-bg-primary/50 p-3 rounded border border-gold-primary/5">
                          <span className="text-text-primary font-bold">Tools/Stack:</span> {srv.tools}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gold-primary/10 pt-5 flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-text-muted font-rajdhani font-bold mb-0.5">EST. RATE</div>
                        <span className="text-gold-light font-bold text-sm">{srv.rate || 'Custom Quote'}</span>
                      </div>
                      <a
                        href={`https://wa.me/917906355122?text=Hi%20Kalvix%20Nexus%2C%20I%2527m%20interested%20in%20your%20${encodeURIComponent(srv.title || 'Service')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-gold-primary/20 hover:border-gold-primary bg-bg-card hover:bg-gold-primary hover:text-black rounded text-[11px] font-rajdhani font-black tracking-widest uppercase transition-all duration-300"
                      >
                        <span>Acquire Engine</span>
                        <ArrowRight size={12} />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}