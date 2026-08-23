'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { ref, push } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus('idle');
    try {
      const leadsRef = ref(db, 'leads');
      await push(leadsRef, {
        ...form,
        timestamp: new Date().toISOString()
      });
      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen pb-24 relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-20 left-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-20 right-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-15" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-rajdhani text-xs font-bold tracking-[0.4em] text-gold-primary uppercase">Contact Us</span>
            <h1 className="font-orbitron font-black text-3xl sm:text-5xl text-text-primary mt-2 mb-4 uppercase tracking-wider">
              Get In Touch
            </h1>
            <p className="text-text-muted text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Have a question or ready to scale your project? Drop us a line and our team will get back to you within 24 hours.
            </p>
          </motion.div>
        </div>

        {/* Double-column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto">
          
          {/* Left: Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="bg-bg-card border border-gold-primary/10 p-8 rounded-xl space-y-6">
              <h2 className="font-orbitron font-bold text-lg text-text-primary mb-2 tracking-wide">
                Base Operations
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                We work with ambitious clients globally. You can connect with us directly via email, phone, or schedule a quick chat on WhatsApp.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-gold-primary/5 border border-gold-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail size={16} className="text-gold-primary" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-wider">Email Us</h4>
                    <a href="mailto:kalvixnexus@gmail.com" className="text-xs text-text-muted hover:text-white hover:underline transition-colors block mt-0.5">
                      kalvixnexus@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-gold-primary/5 border border-gold-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare size={16} className="text-gold-primary" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-wider">WhatsApp</h4>
                    <a 
                      href="https://wa.me/917906355122?text=Hi%20Kalvix%20Nexus%2C%20I%20want%20to%20discuss%20a%20project" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-text-muted hover:text-white hover:underline transition-colors block mt-0.5"
                    >
                      +91 79063 55122
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-gold-primary/5 border border-gold-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={16} className="text-gold-primary" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-wider">Location</h4>
                    <p className="text-xs text-text-muted leading-relaxed mt-0.5">
                      Hathras, Uttar Pradesh, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative growth card */}
            <div className="bg-gradient-to-br from-gold-primary/5 to-transparent border border-gold-primary/10 p-8 rounded-xl">
              <h4 className="font-orbitron font-bold text-xs text-gold-primary uppercase tracking-wider mb-2">Why Partner With Us?</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">
                We deliver conversion-focused solutions. Every site we build is optimized for fast load speeds, clean SEO rankings, and maximized lead acquisition metrics.
              </p>
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <div className="bg-bg-card border border-gold-primary/10 p-8 rounded-xl">
              <form onSubmit={handlePost} className="space-y-6">
                
                {status === 'success' && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg flex items-center gap-3 text-xs">
                    <CheckCircle2 size={16} className="flex-shrink-0" />
                    <span>Thank you! Your message has been sent successfully. We will get back to you shortly.</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center gap-3 text-xs">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>Failed to send message. Please check your connection or email us directly at kalvixnexus@gmail.com.</span>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-wider block mb-2">
                    Your Name
                  </label>
                  <input
                    required
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                    className="w-full bg-bg-primary border border-gold-primary/20 rounded-lg p-3 text-xs text-text-primary focus:outline-none focus:border-gold-primary transition-colors placeholder:text-text-muted/50"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-wider block mb-2">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    className="w-full bg-bg-primary border border-gold-primary/20 rounded-lg p-3 text-xs text-text-primary focus:outline-none focus:border-gold-primary transition-colors placeholder:text-text-muted/50"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-wider block mb-2">
                    Phone Number <span className="text-text-muted normal-case tracking-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+91 98765 43210"
                    className="w-full bg-bg-primary border border-gold-primary/20 rounded-lg p-3 text-xs text-text-primary focus:outline-none focus:border-gold-primary transition-colors placeholder:text-text-muted/50"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-wider block mb-2">
                    Tell us about your project
                  </label>
                  <textarea
                    required
                    id="message"
                    rows={5}
                    placeholder="Describe your project, goals, and budget..."
                    className="w-full bg-bg-primary border border-gold-primary/20 rounded-lg p-3 text-xs text-text-primary focus:outline-none focus:border-gold-primary transition-colors placeholder:text-text-muted/50"
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 bg-gold-primary text-black font-rajdhani font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none shimmer-btn"
                >
                  {sending ? (
                    <>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}