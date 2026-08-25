import React from 'react';
import Image from 'next/image';

export default function Loader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-20 h-20 flex items-center justify-center mb-4">
        {/* Clockwise rotating ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-gold-primary border-r-gold-primary animate-spin shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
        
        {/* Website Logo */}
        <div className="relative w-20 h-20 z-10 opacity-90 animate-pulse scale-[1.30]">
          <Image src="/logo.png" alt="Loading..." fill className="object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
        </div>
      </div>
      <span className="font-rajdhani uppercase tracking-[0.2em] text-gold-primary font-bold text-xs animate-pulse">
        {text}
      </span>
    </div>
  );
}
