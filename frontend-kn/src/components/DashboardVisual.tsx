'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Code2, Cpu, Smartphone } from 'lucide-react';

export default function DashboardVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for rotation
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse position to rotation angles (limit rotation to subtle degrees)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate relative mouse position (-0.5 to 0.5)
    const relativeX = (e.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (e.clientY - rect.top) / rect.height - 0.5;
    
    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseLeave = () => {
    // Reset to initial isometric-like view when mouse leaves
    x.set(-0.2); // slight negative Y rotation
    y.set(0.1);  // slight positive X rotation
  };

  // Set initial default rotation values to match the static view
  React.useEffect(() => {
    x.set(-0.2);
    y.set(0.1);
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-2xl mx-auto flex justify-center items-center h-[400px] lg:h-[500px] [perspective:1200px]"
    >
      
      {/* Main Dashboard Window */}
      <motion.div 
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-[75%] sm:w-[80%] md:w-[75%] aspect-[1.5/1] bg-[#1C1C1C] rounded-2xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),_0_0_20px_rgba(212,175,55,0.1)] overflow-visible group"
      >
        {/* Top Bar */}
        <div className="h-10 border-b border-white/5 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="px-3 py-1 rounded-full border border-white/10 text-[10px] text-white/40 font-mono tracking-widest">
            NEXUS_SYSTEMS_V2
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="p-2 sm:p-4 grid grid-cols-3 grid-rows-2 gap-2 sm:gap-4 h-[calc(100%-40px)]">
          
          {/* Revenue Panel (Takes 2 columns) */}
          <div className="col-span-2 row-span-1 bg-[#252525] rounded-xl border border-white/5 p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden">
            <div>
              <p className="text-[8px] sm:text-[10px] font-bold text-white/40 tracking-wider mb-1">REVENUE GROWTH</p>
              <h3 className="text-lg sm:text-2xl font-bold text-white">+350.48%</h3>
            </div>
            {/* Sparkline */}
            <svg viewBox="0 0 100 40" className="w-full h-12 stroke-gold-primary fill-none overflow-visible">
              <path d="M0,35 Q15,35 25,25 T50,25 T75,10 T100,10" strokeWidth="2" strokeLinecap="round" />
              <circle cx="100" cy="10" r="2" className="fill-gold-primary" />
            </svg>
          </div>

          {/* Conversion Panel (Takes 1 column, 2 rows) */}
          <div className="col-span-1 row-span-2 bg-[#252525] rounded-xl border border-white/5 p-2 sm:p-4 flex flex-col items-center justify-between">
            <p className="text-[8px] sm:text-[10px] font-bold text-white/40 tracking-wider w-full text-center">CONVERSION</p>
            
            {/* Circular Progress */}
            <div className="relative w-12 h-12 sm:w-20 sm:h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" className="stroke-white/10 fill-none" strokeWidth="6" />
                <circle cx="40" cy="40" r="32" className="stroke-gold-primary fill-none" strokeWidth="6" strokeDasharray="201" strokeDashoffset="50" strokeLinecap="round" />
              </svg>
              <span className="absolute text-[10px] sm:text-xs font-bold text-white">75%</span>
            </div>

            <p className="text-[9px] text-white/30 text-center">Funnels optimized.</p>
          </div>

          {/* Uptime Panel */}
          <div className="col-span-1 row-span-1 bg-[#252525] rounded-xl border border-white/5 p-2 sm:p-4 flex flex-col justify-center">
            <p className="text-[8px] sm:text-[10px] font-bold text-white/40 tracking-wider mb-1 truncate">UPTIME</p>
            <h3 className="text-sm sm:text-xl font-bold text-[#27C93F] truncate">99.998%</h3>
          </div>

          {/* Engines Panel */}
          <div className="col-span-1 row-span-1 bg-[#252525] rounded-xl border border-white/5 p-2 sm:p-4 flex flex-col justify-center">
            <p className="text-[8px] sm:text-[10px] font-bold text-white/40 tracking-wider mb-1 truncate">ENGINES</p>
            <h3 className="text-sm sm:text-xl font-bold text-gold-primary truncate">14 active</h3>
          </div>

        </div>

        {/* Shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
      </motion.div>

      {/* Floating Pill 1 (Top Left) */}
      <motion.div
        style={{ transform: 'translateZ(60px)' }}
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-1 sm:-left-10 lg:-left-16 scale-[0.7] sm:scale-100 origin-left bg-white dark:bg-[#111] rounded-2xl p-3 shadow-2xl border border-black/5 dark:border-white/5 flex items-center gap-3 z-30"
      >
        <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center">
          <Code2 size={14} className="text-gold-primary" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-black dark:text-white leading-tight">WEB DEV</p>
          <p className="text-[9px] text-gray-500 font-mono">Next.js</p>
        </div>
      </motion.div>

      {/* Floating Pill 2 (Bottom Left) */}
      <motion.div
        style={{ transform: 'translateZ(80px)' }}
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-4 sm:bottom-10 left-0 sm:-left-5 lg:-left-10 scale-[0.7] sm:scale-100 origin-left bg-white dark:bg-[#111] rounded-2xl p-3 shadow-2xl border border-black/5 dark:border-white/5 flex items-center gap-3 z-30"
      >
        <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center">
          <Cpu size={14} className="text-gold-primary" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-black dark:text-white leading-tight">AI SYSTEMS</p>
          <p className="text-[9px] text-gray-500 font-mono">Custom LLM</p>
        </div>
      </motion.div>

      {/* Floating Pill 3 (Right) */}
      <motion.div
        style={{ transform: 'translateZ(100px)' }}
        animate={{ y: [-3, 3, -3] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 -translate-y-1/2 right-0 sm:-right-5 lg:-right-16 scale-[0.7] sm:scale-100 origin-right bg-white dark:bg-[#111] rounded-2xl p-3 shadow-2xl border border-black/5 dark:border-white/5 flex items-center gap-3 z-30"
      >
        <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center">
          <Smartphone size={14} className="text-gold-primary" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-black dark:text-white leading-tight">MOBILE</p>
          <p className="text-[9px] text-gray-500 font-mono">iOS & Android</p>
        </div>
      </motion.div>

    </div>
  );
}
