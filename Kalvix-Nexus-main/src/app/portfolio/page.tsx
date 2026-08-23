'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const CATEGORIES = [
  { id: 'all', label: 'All Work' },
  { id: 'web', label: 'Web Platforms' },
  { id: 'marketing', label: 'Marketing Campaigns' },
  { id: 'branding', label: 'Brand Identity' },
];

export default function PortfolioPage() {
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectsRef = ref(db, 'projects');
    onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedProjects = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProjects(loadedProjects);
      }
      setLoading(false);
    });
  }, []);

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute top-10 left-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-10 right-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-15" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-rajdhani text-xs font-bold tracking-[0.4em] text-gold-primary uppercase">Case Studies</span>
            <h1 className="font-orbitron font-black text-3xl sm:text-5xl text-text-primary mt-2 mb-4 uppercase tracking-wider">
              Our Portfolio
            </h1>
            <p className="text-text-muted text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Explore how we've engineered growth for our partners through high-converting web assets and data-driven marketing campaigns.
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
              {filteredProjects.map((project, idx) => (
                <motion.div
                  layout
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="group relative bg-bg-card border border-gold-primary/10 rounded-xl overflow-hidden hover:border-gold-primary/40 transition-all duration-500"
                >
                  <div className="h-64 sm:h-80 w-full relative overflow-hidden bg-black/50">
                    {project.image ? (
                      <Image 
                        src={project.image} 
                        alt={project.title || 'Project Image'} 
                        fill 
                        className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-orbitron text-text-muted text-xs tracking-widest uppercase">
                        [ Image Placeholder ]
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-gold-primary/30 text-gold-primary px-3 py-1 rounded-full text-[9px] font-rajdhani font-black tracking-widest uppercase">
                      {project.category || 'Category'}
                    </div>
                  </div>

                  <div className="p-8 relative">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-orbitron font-bold text-xl text-text-primary group-hover:text-gold-primary transition-colors mb-2">
                          {project.title}
                        </h3>
                        <p className="text-text-muted text-xs leading-relaxed max-w-sm">
                          {project.desc}
                        </p>
                      </div>
                      
                      <Link href={`/portfolio/${project.id}`} className="w-10 h-10 rounded-full bg-gold-primary/5 border border-gold-primary/20 flex items-center justify-center text-gold-primary group-hover:bg-gold-primary group-hover:text-black transition-all duration-300">
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-6 border-t border-gold-primary/10 pt-6">
                      <div className="flex-1">
                        <span className="block text-[9px] font-rajdhani font-black text-text-muted uppercase tracking-widest mb-1">Impact</span>
                        <span className="text-sm font-mono text-emerald-400 font-bold">{project.stats || 'N/A'}</span>
                      </div>
                      
                      {project.link && (
                        <a 
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-rajdhani font-bold uppercase tracking-widest text-text-muted hover:text-gold-primary transition-colors"
                        >
                          Live Link <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}