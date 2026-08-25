'use client';

import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isHovered: false,
    isHidden: true,
    isTouchDevice: false,
  });

  useEffect(() => {
    // Detect touch device
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    cursorRef.current.isTouchDevice = isTouch;
    if (isTouch) return;

    const dot = dotRef.current;
    const ring = ringRef.current;

    const moveCursor = (e: MouseEvent) => {
      cursorRef.current.targetX = e.clientX;
      cursorRef.current.targetY = e.clientY;
      
      if (cursorRef.current.isHidden) {
        cursorRef.current.isHidden = false;
        if (dot) dot.style.opacity = '1';
        if (ring) ring.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      cursorRef.current.isHidden = true;
      if (dot) dot.style.opacity = '0';
      if (ring) ring.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      cursorRef.current.isHidden = false;
      if (dot) dot.style.opacity = '1';
      if (ring) ring.style.opacity = '1';
    };

    // Event delegation for hover states
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const isInteractive = target.closest('a, button, select, input, textarea, [role="button"], .interactive-cursor');
      if (isInteractive) {
        cursorRef.current.isHovered = true;
        if (ring) {
          ring.classList.add('w-12', 'h-12', 'bg-gold-primary/20', 'border-gold-light', 'shadow-gold-glow');
          ring.classList.remove('w-10', 'h-10', 'border-gold-primary/40');
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive = target.closest('a, button, select, input, textarea, [role="button"], .interactive-cursor');
      if (isInteractive) {
        cursorRef.current.isHovered = false;
        if (ring) {
          ring.classList.remove('w-12', 'h-12', 'bg-gold-primary/20', 'border-gold-light', 'shadow-gold-glow');
          ring.classList.add('w-10', 'h-10', 'border-gold-primary/40');
        }
      }
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    // Animation loop using refs
    let frameId: number;
    const updatePosition = () => {
      const { x, y, targetX, targetY } = cursorRef.current;
      
      // Interpolate ring position for lag effect
      const nextX = x + (targetX - x) * 0.15;
      const nextY = y + (targetY - y) * 0.15;
      
      cursorRef.current.x = nextX;
      cursorRef.current.y = nextY;

      if (dot) {
        dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate3d(-50%, -50%, 0)`;
      }
      if (ring) {
        ring.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) translate3d(-50%, -50%, 0)`;
      }

      frameId = requestAnimationFrame(updatePosition);
    };

    frameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  if (isTouch) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-gold-primary rounded-full pointer-events-none z-[9999] opacity-0 transition-opacity duration-300 ease-out"
        style={{ willChange: 'transform' }}
      />
      {/* Outer Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998] opacity-0 transition-all duration-200 ease-out w-10 h-10 border border-gold-primary/40"
        style={{ willChange: 'transform' }}
      />
    </>
  );
}