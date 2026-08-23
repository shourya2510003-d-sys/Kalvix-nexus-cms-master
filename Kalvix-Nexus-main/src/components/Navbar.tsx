'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-400 ${
          scrolled
            ? 'bg-bg-primary/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-gold-primary/10 py-3'
            : 'bg-transparent border-b border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">

          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Kalvix Nexus Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-orbitron font-black text-sm tracking-[0.12em] text-text-primary leading-none block">
                KALVIX
              </span>
              <span className="font-orbitron font-black text-[10px] tracking-[0.25em] text-gold-primary leading-none block">
                NEXUS
              </span>
            </div>
          </Link>

          {/* CENTER: Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-all duration-200 rounded-lg group ${
                    active
                      ? 'text-gold-primary'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0.5 left-4 right-4 h-[1.5px] bg-gold-primary rounded-full"
                    />
                  )}
                  <span className="absolute inset-0 rounded-lg bg-gold-primary/0 group-hover:bg-gold-primary/5 transition-colors duration-200" />
                </Link>
              );
            })}
          </div>

          {/* RIGHT: Actions */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            <Link
              href="/contact"
              className="shimmer-btn inline-flex items-center gap-2 bg-gold-primary text-black font-rajdhani font-bold text-xs tracking-widest uppercase px-5 py-2.5 rounded-lg hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
            >
              Start Your Project
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* MOBILE: Theme + Hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gold-primary/20 text-text-primary hover:bg-gold-primary/5 transition-colors"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 bg-bg-primary z-[49] flex flex-col lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gold-primary/10">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
                <Image src="/logo.png" alt="Kalvix Nexus" width={36} height={36} className="object-contain" />
                <span className="font-orbitron font-black text-sm tracking-widest text-gold-primary">
                  KALVIX NEXUS
                </span>
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gold-primary/20 text-text-primary hover:bg-gold-primary/5 transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 flex flex-col justify-center px-6 gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 + 0.1 }}
                >
                  <Link
                    href={link.path}
                    className={`flex items-center justify-between py-4 border-b border-gold-primary/8 group transition-colors ${
                      pathname === link.path ? 'text-gold-primary' : 'text-text-primary hover:text-gold-primary'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-gold-primary/40">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-orbitron font-black text-xl tracking-wider uppercase">{link.label}</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gold-primary/40 group-hover:text-gold-primary group-hover:translate-x-1 transition-all">
                      <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="px-6 pb-10 pt-6 space-y-4 border-t border-gold-primary/10">
              <Link
                href="/contact"
                className="shimmer-btn flex w-full items-center justify-center gap-2 bg-gold-primary text-black font-rajdhani font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-xl"
                onClick={() => setMenuOpen(false)}
              >
                Start Your Project →
              </Link>
              <p className="text-center text-text-muted text-xs font-rajdhani tracking-wider">
                📍 Hathras, Uttar Pradesh · +91 79063 55122
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
