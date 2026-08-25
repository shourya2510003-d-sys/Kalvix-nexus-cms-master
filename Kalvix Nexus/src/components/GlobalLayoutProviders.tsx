'use client';

import React, { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CustomCursor from './CustomCursor';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';

const FloatingChatbotWidget = dynamic(() => import('./FloatingChatbotWidget'), { ssr: false });
const FloatingWhatsApp = dynamic(() => import('./FloatingWhatsApp'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function GlobalLayoutProviders({ children, isSubdomain = false }: { children: React.ReactNode, isSubdomain?: boolean }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Instantly show content on route change
  useEffect(() => {
    if (!mounted || !mainRef.current) return;
    const el = mainRef.current;
    el.style.opacity = '1';
  }, [pathname, mounted]);

  const isAdminRoute = pathname.startsWith('/kn2026');
  const isEmployeeRoute = pathname.startsWith('/employee-dashboard');
  const isClientDashboard = pathname.startsWith('/client/dashboard');
  const isTenantAdmin = pathname.startsWith('/tenant-admin');
  const isHiddenRoute = isAdminRoute || isEmployeeRoute || isClientDashboard || isTenantAdmin || isSubdomain;

  return (
    <>
      <CustomCursor />
      {!isHiddenRoute && <Navbar />}

      <main
        ref={mainRef}
        className={`min-h-screen ${!isHiddenRoute ? 'pt-20' : ''}`}
        style={{ opacity: mounted ? 1 : 1 }}
      >
        {children}
      </main>

      {!isHiddenRoute && (
        <>
          <Footer />
          <FloatingChatbotWidget />
          <FloatingWhatsApp />
        </>
      )}
    </>
  );
}