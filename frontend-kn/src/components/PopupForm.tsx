'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { ref, push } from 'firebase/database';
import { db } from '@/lib/firebase';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function PopupForm() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (pathname !== '/') return;
    
    const timer1 = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    const timer2 = setTimeout(() => {
      setIsOpen(true);
    }, 60000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname]);

  if (pathname !== '/') return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus('idle');
    try {
      const leadsRef = ref(db, 'leads');
      await push(leadsRef, {
        ...form,
        source: 'Popup Form',
        timestamp: new Date().toISOString()
      });
      
      const waMessage = `*New Lead from Popup Form*%0A*Name:* ${form.name}%0A*Email:* ${form.email}%0A*Phone:* ${form.phone}%0A*Message:* ${form.message}`;
      const waUrl = `https://wa.me/917906355122?text=${waMessage}`;
      window.open(waUrl, '_blank');

      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ perspective: '1200px' }} className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Intense Background Glow behind Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute w-[450px] h-[450px] bg-gold-glow rounded-full blur-[100px] pointer-events-none" 
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, rotateX: 45, rotateY: -45, z: -800, scale: 0.8 }}
            animate={{ opacity: 1, rotateX: 0, rotateY: 0, z: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.3 } }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#111111]/95 border border-gold-primary/50 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.15),inset_0_0_20px_rgba(212,175,55,0.05)] transform-gpu backdrop-blur-xl"
            style={{ transformStyle: 'preserve-3d', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Top Border Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-80" />

            {/* Header */}
            <div style={{ backgroundColor: 'rgba(10,10,10,0.8)', transformStyle: 'preserve-3d' }} className="border-b border-gold-primary/20 p-4 flex items-center justify-between relative shrink-0 z-10 backdrop-blur-md">
              <motion.div
                initial={{ x: -100, opacity: 0, translateZ: 50 }}
                animate={{ x: 0, opacity: 1, translateZ: 20 }}
                transition={{ duration: 1, delay: 0.8, type: 'spring' }}
              >
                <h3 className="font-orbitron font-bold text-lg text-gold-primary tracking-wide drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">Ready to Scale?</h3>
                <p className="text-[11px] text-gray-300 mt-1 drop-shadow-sm">Get a free consultation today.</p>
              </motion.div>
              <motion.button 
                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                onClick={handleClose}
                style={{ backgroundColor: 'rgba(31,31,31,0.5)', color: '#9ca3af' }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gold-primary/20 hover:text-gold-primary hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-300 shrink-0"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Form */}
            <div className="p-6 md:p-8 overflow-y-auto" style={{ backgroundColor: '#111111', transformStyle: 'preserve-3d' }}>
              <form onSubmit={handlePost} className="space-y-6" style={{ transformStyle: 'preserve-3d' }}>
                
                <AnimatePresence>
                  {status === 'success' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg flex items-center gap-3 text-xs"
                    >
                      <CheckCircle2 size={16} className="flex-shrink-0" />
                      <span>Thank you! Your message has been sent successfully.</span>
                    </motion.div>
                  )}

                  {status === 'error' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center gap-3 text-xs"
                    >
                      <AlertCircle size={16} className="flex-shrink-0" />
                      <span>Failed to send message. Please try again.</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ x: -150, opacity: 0, rotateY: -30, translateZ: 80 }}
                  animate={{ x: 0, opacity: 1, rotateY: 0, translateZ: 30 }}
                  transition={{ duration: 1.2, delay: 1.2, type: 'spring', bounce: 0.3 }}
                >
                  <label htmlFor="popup-name" className="text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-wider block mb-2 drop-shadow-md">
                    Your Name
                  </label>
                  <input
                    required
                    type="text"
                    id="popup-name"
                    placeholder="Enter your name"
                    className="w-full bg-[#1a1a1a] border border-gold-primary/20 rounded-lg p-3 text-xs text-text-primary focus:outline-none focus:border-gold-primary transition-all duration-300 placeholder:text-text-muted/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                  />
                </motion.div>

                <motion.div
                  initial={{ x: 150, opacity: 0, rotateY: 30, translateZ: 80 }}
                  animate={{ x: 0, opacity: 1, rotateY: 0, translateZ: 30 }}
                  transition={{ duration: 1.2, delay: 1.5, type: 'spring', bounce: 0.3 }}
                >
                  <label htmlFor="popup-email" className="text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-wider block mb-2 drop-shadow-md">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    id="popup-email"
                    placeholder="Enter your email"
                    className="w-full bg-[#1a1a1a] border border-gold-primary/20 rounded-lg p-3 text-xs text-text-primary focus:outline-none focus:border-gold-primary transition-all duration-300 placeholder:text-text-muted/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                  />
                </motion.div>

                <motion.div
                  initial={{ x: -150, opacity: 0, rotateY: -30, translateZ: 80 }}
                  animate={{ x: 0, opacity: 1, rotateY: 0, translateZ: 30 }}
                  transition={{ duration: 1.2, delay: 1.8, type: 'spring', bounce: 0.3 }}
                >
                  <label htmlFor="popup-phone" className="text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-wider block mb-2 drop-shadow-md">
                    Phone Number <span className="text-text-muted normal-case tracking-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="popup-phone"
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#1a1a1a] border border-gold-primary/20 rounded-lg p-3 text-xs text-text-primary focus:outline-none focus:border-gold-primary transition-all duration-300 placeholder:text-text-muted/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                  />
                </motion.div>

                <motion.div
                  initial={{ x: 150, opacity: 0, rotateY: 30, translateZ: 80 }}
                  animate={{ x: 0, opacity: 1, rotateY: 0, translateZ: 30 }}
                  transition={{ duration: 1.2, delay: 2.1, type: 'spring', bounce: 0.3 }}
                >
                  <label htmlFor="popup-message" className="text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-wider block mb-2 drop-shadow-md">
                    Tell us about your project
                  </label>
                  <textarea
                    required
                    id="popup-message"
                    rows={3}
                    placeholder="Describe your project, goals, and budget..."
                    className="w-full bg-[#1a1a1a] border border-gold-primary/20 rounded-lg p-3 text-xs text-text-primary focus:outline-none focus:border-gold-primary transition-all duration-300 placeholder:text-text-muted/50 resize-none focus:shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                  />
                </motion.div>

                <motion.button
                  initial={{ y: 100, opacity: 0, translateZ: 100 }}
                  animate={{ y: 0, opacity: 1, translateZ: 40 }}
                  transition={{ duration: 1.2, delay: 2.5, type: 'spring', bounce: 0.4 }}
                  whileHover={{ scale: 1.02, translateZ: 60 }}
                  whileTap={{ scale: 0.98, translateZ: 20 }}
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 bg-gold-primary text-black font-rajdhani font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none shadow-[0_10px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_30px_rgba(212,175,55,0.5)]"
                >
                  {sending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Message</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
