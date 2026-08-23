'use client';

import React, { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from './CustomCursor';
import FloatingVapiWidget from './FloatingVapiWidget';
import FloatingWhatsApp from './FloatingWhatsApp';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function GlobalLayoutProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fade in page content on route change — NO remount, so no black flash
  useEffect(() => {
    if (!mounted || !mainRef.current) return;
    const el = mainRef.current;
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0px)';
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, mounted]);

  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <>
      <CustomCursor />
      {!isAdminRoute && <Navbar />}

      <main
        ref={mainRef}
        className={`min-h-screen ${!isAdminRoute ? 'pt-20' : ''}`}
        style={{ opacity: mounted ? 1 : 1 }}
      >
        {children}
      </main>

      {!isAdminRoute && (
        <>
          <Footer />
          <FloatingVapiWidget />
          <FloatingWhatsApp />
        </>
      )}
    </>
  );
}