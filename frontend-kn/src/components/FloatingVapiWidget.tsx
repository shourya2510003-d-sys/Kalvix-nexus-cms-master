'use client';

import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FloatingVapiWidget() {
  const [vapiInstance, setVapiInstance] = useState<any>(null);
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'active'>('idle');

  useEffect(() => {
    import('@vapi-ai/web').then((VapiSDK) => {
      const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "placeholder-token";
      const instance = new VapiSDK.default(key);
      setVapiInstance(instance);

      instance.on('call-start', () => setCallState('active'));
      instance.on('call-end', () => setCallState('idle'));
      instance.on('error', () => setCallState('idle'));
    }).catch(err => console.error("Pipeline failure binding Vapi runtime script context", err));
  }, []);

  const handleToggleCallConnection = async () => {
    if (!vapiInstance) return;
    if (callState === 'active') {
      vapiInstance.stop();
    } else {
      setCallState('connecting');
      try {
        await vapiInstance.start({
          name: "Kalvix Nexus AI Assistant",
          model: {
            provider: "openai",
            model: "gpt-4-turbo",
            messages: [
              {
                role: "system",
                content: "You are Kalvix Nexus AI Assistant, a friendly and highly capable virtual assistant for Kalvix Nexus, a Premium Technology Agency specializing in Web Development, Android Applications, AI Solutions, and Automation Assets. Your main goal is to help users learn about the company's services, pricing, and web structures. However, you must also be polite and conversational: if a user asks 'how are you?', replies playfully, or asks general questions about what you do, answer them naturally and warmly. If a user asks you to speak in a different language (e.g., Hindi, Spanish), seamlessly switch to that language and continue the conversation. Always maintain a helpful, professional, yet approachable tone."
              }
            ]
          }
        });
      } catch {
        setCallState('idle');
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      
      {/* Speech Bubble / Tooltip (Opposite theme: Light bg, Dark text) */}
      {callState === 'idle' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.5, type: "spring", stiffness: 200 }}
          className="bg-bg-primary text-text-primary px-4 py-2 rounded-2xl shadow-2xl relative text-xs font-bold whitespace-nowrap animate-bounce border border-border"
          style={{ animationDuration: '2s' }}
        >
          Talk to AI
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-bg-primary border-b border-r border-border transform rotate-45" />
        </motion.div>
      )}

      {/* Connection State Info */}
      {callState !== 'idle' && (
        <div className="bg-bg-primary text-text-primary border border-gold-primary/30 px-3 py-1.5 rounded-2xl text-[11px] font-mono flex items-center gap-2 shadow-lg mb-1">
          {callState === 'connecting' ? <Loader2 size={12} className="animate-spin text-gold-primary" /> : <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
          <span className="capitalize">{callState}...</span>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleToggleCallConnection}
        className={`w-14 h-14 flex items-center justify-center rounded-full shadow-gold-glow hover:scale-110 border-2 transition-all duration-300 ${
          callState === 'active' 
            ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
            : 'bg-bg-primary border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-black'
        }`}
        aria-label="Voice AI Assistant"
      >
        {callState === 'active' ? <MicOff size={24} /> : <Mic size={24} />}
      </button>
    </div>
  );
}