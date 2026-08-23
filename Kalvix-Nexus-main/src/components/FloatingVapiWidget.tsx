'use client';

import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

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
                                                                                                                                                                                                  content: "You are the automated assistant representing Kalvix Nexus. Answer questions clearly about pricing, app designs, and web structures. Request user identity parameters and operational targets."
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
                                                                                                                                                                                                                                                                              <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
                                                                                                                                                                                                                                                                                    {callState !== 'idle' && (
                                                                                                                                                                                                                                                                                            <div className="bg-bg-card border border-gold-primary/30 px-3 py-1.5 rounded text-[11px] font-mono text-gold-light flex items-center gap-2 backdrop-blur">
                                                                                                                                                                                                                                                                                                      {callState === 'connecting' ? <Loader2 size={12} className="animate-spin" /> : <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                                                                                                                                                                                                                                                                                                                <span className="capitalize">{callState}... Connecting AI Stream</span>
                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                              )}
                                                                                                                                                                                                                                                                                                                                    <button
                                                                                                                                                                                                                                                                                                                                            onClick={handleToggleCallConnection}
                                                                                                                                                                                                                                                                                                                                                    className={`p-3.5 rounded-full shadow-gold-glow border transition-all duration-300 ${
                                                                                                                                                                                                                                                                                                                                                              callState === 'active' ? 'bg-red-600 border-red-400 text-white' : 'bg-bg-card border-gold-primary/40 text-gold-primary hover:bg-gold-primary hover:text-black'
                                                                                                                                                                                                                                                                                                                                                                      }`}
                                                                                                                                                                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                                                                                                                                                                    {callState === 'active' ? <MicOff size={22} /> : <Mic size={22} />}
                                                                                                                                                                                                                                                                                                                                                                                          </button>
                                                                                                                                                                                                                                                                                                                                                                                              </div>
                                                                                                                                                                                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                