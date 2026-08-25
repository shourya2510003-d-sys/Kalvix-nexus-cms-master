import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function FloatingWhatsApp() {
  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-center gap-3">
      {/* Speech Bubble / Think Cloud */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.5, type: "spring", stiffness: 200 }}
        className="bg-text-primary text-bg-primary px-4 py-2 rounded-2xl shadow-2xl relative text-xs font-bold whitespace-nowrap animate-bounce"
        style={{ animationDuration: '2s' }}
      >
        May I help you?
        {/* Tail for the speech bubble */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-text-primary transform rotate-45" />
      </motion.div>

      {/* Avatar Button */}
      <a
        href="https://wa.me/917906355122?text=Hello%20Kalvix%20Nexus%20Team%20%F0%9F%91%8B%0AI'm%20interested%20in%20your%20services%20and%20would%20like%20to%20discuss%20my%20project.%20Please%20share%20more%20details%20and%20let%20me%20know%20how%20we%20can%20get%20started.%20Thank%20you!"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-text-primary border-2 border-gold-primary text-2xl w-14 h-14 rounded-full shadow-gold-glow hover:scale-110 transition-transform duration-300 flex items-center justify-center overflow-hidden"
        aria-label="Direct Link Access to WhatsApp Gateway"
      >
        <Image src="/logo.png" alt="WhatsApp Contact" width={40} height={40} className="object-cover w-full h-full p-2" />
      </a>
    </div>
  );
}