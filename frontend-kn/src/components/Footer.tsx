'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Instagram, Phone, Mail, MessageCircle, MapPin, Shield, UserPlus } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#0A0A0A] text-white border-t border-gold-primary/15 pt-20 pb-8 overflow-hidden">
      {/* Grid background texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="footerGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D4AF37" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#footerGridPattern)" />
        </svg>
      </div>

      {/* Decorative gold orb */}
      <div className="absolute top-1/2 right-[-10%] w-[300px] h-[300px] bg-gold-glow rounded-full blur-[100px] pointer-events-none opacity-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-16">
        
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 font-orbitron font-black text-lg tracking-wider text-gold-primary">
            <Image
              src="/logo.png"
              alt="Kalvix Nexus Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <div className="flex flex-col">
              <span className="leading-none block">KALVIX</span>
              <span className="text-[10px] tracking-[0.25em] text-gold-light leading-none mt-0.5">NEXUS</span>
            </div>
          </div>
          <p className="text-text-muted text-xs leading-relaxed font-inter max-w-sm">
            WHERE VISION MEETS TECHNOLOGY. High-end software architectures, bespoke artificial intelligence agents, and conversion-optimized growth ecosystems designed for high trust.
          </p>
          
          {/* Social Icons row */}
          <div className="flex items-center gap-3.5 pt-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:border-gold-primary/60 hover:text-gold-primary flex items-center justify-center transition-all duration-300 hover:scale-105"
              aria-label="LinkedIn Profile"
            >
              <Linkedin size={14} />
            </a>
            <a
              href="https://instagram.com/kalvixnexus"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:border-gold-primary/60 hover:text-gold-primary flex items-center justify-center transition-all duration-300 hover:scale-105"
              aria-label="Instagram Profile"
            >
              <Instagram size={14} />
            </a>
            <a
              href="https://wa.me/917906355122"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:border-gold-primary/60 hover:text-gold-primary flex items-center justify-center transition-all duration-300 hover:scale-105"
              aria-label="WhatsApp Chat"
            >
              <MessageCircle size={14} />
            </a>
          </div>
        </div>

        {/* Column 2: Services */}
        <div>
          <h4 className="font-rajdhani font-bold text-white uppercase tracking-wider text-xs mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-primary" />
            Core Frameworks
          </h4>
          <ul className="space-y-3 text-xs text-text-muted font-inter">
            <li><Link href="/services" className="hover:text-gold-primary transition-colors block">Meta & Google Ads</Link></li>
            <li><Link href="/services" className="hover:text-gold-primary transition-colors block">Social Media Strategy</Link></li>
            <li><Link href="/services" className="hover:text-gold-primary transition-colors block">Web & App Engineering</Link></li>
            <li><Link href="/services" className="hover:text-gold-primary transition-colors block">AI Agents & Automations</Link></li>
          </ul>
        </div>

        {/* Column 3: Corporate Links */}
        <div>
          <h4 className="font-rajdhani font-bold text-white uppercase tracking-wider text-xs mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-primary" />
            Corporate Links
          </h4>
          <ul className="space-y-3 text-xs text-text-muted font-inter">
            <li><Link href="/portfolio" className="hover:text-gold-primary transition-colors block">Project Portfolio</Link></li>
            <li><Link href="/pricing" className="hover:text-gold-primary transition-colors block">Pricing Models</Link></li>
            <li><Link href="/about" className="hover:text-gold-primary transition-colors block">Founder Profiles</Link></li>
            <li><Link href="/" className="hover:text-gold-primary transition-colors block">Client Portal</Link></li>
          </ul>
        </div>

        {/* Column 4: Employee Portal */}
        <div>
          <h4 className="font-rajdhani font-bold text-white uppercase tracking-wider text-xs mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-primary" />
            Employee Portal
          </h4>
          <ul className="space-y-3 text-xs text-text-muted font-inter">
            <li><Link href="/verify" className="hover:text-gold-primary transition-colors block">Certificates Verification</Link></li>
            <li><Link href="/verify-employee" className="hover:text-gold-primary transition-colors block">Employee Verification</Link></li>
          </ul>
          <div className="pt-5 flex flex-col gap-3">
            <Link 
              href="/registration" 
              className="inline-flex items-center gap-2 border border-gold-primary/30 bg-gold-primary/5 hover:bg-gold-primary/10 hover:border-gold-primary/80 text-gold-primary px-4 py-2.5 rounded-xl font-rajdhani font-bold text-[10px] uppercase tracking-widest transition-all duration-200"
            >
              <UserPlus size={10} />
              Registration Form
            </Link>
          </div>
        </div>

        {/* Column 5: Base Operations */}
        <div>
          <h4 className="font-rajdhani font-bold text-white uppercase tracking-wider text-xs mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-primary" />
            Operations Base
          </h4>
          <ul className="space-y-3 text-xs text-text-muted font-inter">
            <li className="flex items-start gap-2 leading-relaxed">
              <MapPin size={12} className="text-gold-primary mt-0.5 flex-shrink-0" />
              <span>Hathras, Uttar Pradesh, India</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={12} className="text-gold-primary flex-shrink-0" />
              <a href="mailto:kalvixnexus@gmail.com" className="hover:text-gold-primary hover:underline transition-colors font-mono">
                kalvixnexus@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={12} className="text-gold-primary flex-shrink-0" />
              <a href="tel:+917906355122" className="hover:text-gold-primary hover:underline transition-colors font-mono">
                +91 79063 55122
              </a>
            </li>
          </ul>
          
          <div className="pt-5 flex flex-col gap-3">
            <Link 
              href="/kn2026" 
              className="inline-flex items-center gap-2 border border-gold-primary/30 bg-gold-primary/5 hover:bg-gold-primary/10 hover:border-gold-primary/80 text-gold-primary px-4 py-2.5 rounded-xl font-rajdhani font-bold text-[10px] uppercase tracking-widest transition-all duration-200"
            >
              <Shield size={10} />
              Portal Access
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom copy row */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[10px] text-text-muted gap-4">
        <div>© {new Date().getFullYear()} Kalvix Nexus. All rights reserved. Registered under Indian Operations.</div>
        <div className="font-rajdhani tracking-widest uppercase text-gold-primary flex items-center gap-1.5 font-bold">
          <Link href="/kn2026?type=admin" className="hover:text-gold-light transition-colors">Designed by Kalvix Nexus</Link>
        </div>
      </div>
    </footer>
  );
}