'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function AnimatedCounter({ value, duration = 2000, suffix = "", prefix = "" }: { value: number; duration?: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * value));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [value, duration, hasAnimated]);

  return (
    <span ref={elementRef} className="tabular-nums font-bold">
      {prefix}{count}{suffix}
    </span>
  );
}

export default function TrustBar() {
  return (
    <section className="py-12 bg-bg-card border-y border-border relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="text-3xl md:text-4xl text-text-primary font-outfit mb-2">
              <AnimatedCounter value={150} suffix="+" />
            </div>
            <div className="text-xs md:text-sm text-text-muted font-medium uppercase tracking-wider">Projects Delivered</div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="text-3xl md:text-4xl text-text-primary font-outfit mb-2">
              <AnimatedCounter value={50} suffix="+" />
            </div>
            <div className="text-xs md:text-sm text-text-muted font-medium uppercase tracking-wider">Clients Supported</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="text-3xl md:text-4xl text-text-primary font-outfit mb-2">
              <AnimatedCounter value={12} suffix="+" />
            </div>
            <div className="text-xs md:text-sm text-text-muted font-medium uppercase tracking-wider">Industries Served</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
            <div className="text-3xl md:text-4xl text-text-primary font-outfit mb-2">
              <AnimatedCounter value={1} suffix="+" />
            </div>
            <div className="text-xs md:text-sm text-text-muted font-medium uppercase tracking-wider">Countries Reached</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
