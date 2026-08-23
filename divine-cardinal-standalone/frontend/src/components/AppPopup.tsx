'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { db, ref, onValue } from '../lib/firebase';
import Link from 'next/link';

export default function AppPopup() {
  const [config, setConfig] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const popupRef = ref(db, 'global_elements/popup');
    const unsubscribe = onValue(popupRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setConfig(data);
        
        // Logic to show popup
        if (data.enabled) {
          // Check if already shown in this session or dismissed via cookie/localStorage
          const hasSeenPopup = localStorage.getItem('dc_popup_seen');
          if (!hasSeenPopup) {
            // Show after 3 seconds
            setTimeout(() => {
              setIsOpen(true);
            }, 3000);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('dc_popup_seen', 'true');
  };

  if (!isOpen || !config || !config.enabled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-luxury-cream max-w-4xl w-full flex flex-col md:flex-row overflow-hidden shadow-2xl relative"
        >
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 text-luxury-charcoal/50 hover:text-luxury-charcoal transition-colors bg-white/50 backdrop-blur rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Side: Image */}
          {config.image && (
            <div className="w-full md:w-1/2 h-64 md:h-auto relative">
              <img 
                src={config.image} 
                alt="Promotional Offer" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Right Side: Content */}
          <div className={`w-full ${config.image ? 'md:w-1/2' : 'w-full'} p-8 md:p-12 flex flex-col justify-center items-center text-center`}>
            <span className="font-sans text-[10px] tracking-widest uppercase text-luxury-gold mb-4">Divine Cardinal</span>
            <h2 className="font-serif text-2xl md:text-3xl text-luxury-charcoal mb-4 tracking-wide leading-tight">
              {config.title}
            </h2>
            <p className="font-sans text-sm text-luxury-charcoal/70 mb-8 max-w-xs mx-auto">
              {config.description}
            </p>
            {config.buttonText && config.link && (
              <Link 
                href={config.link}
                onClick={handleClose}
                className="bg-luxury-gold hover:bg-[#a88d5a] text-white px-8 py-3 text-xs tracking-widest uppercase transition-colors"
              >
                {config.buttonText}
              </Link>
            )}
            <button 
              onClick={handleClose}
              className="mt-6 text-[10px] uppercase tracking-widest text-luxury-charcoal/40 hover:text-luxury-charcoal underline underline-offset-4"
            >
              No thanks, I'll explore first
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
