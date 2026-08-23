'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { db, ref, onValue } from '../lib/firebase';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatbotRef = ref(db, 'integrations/chatbot');
    const unsub = onValue(chatbotRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setConfig(data);
        if (data.welcomeMessage && messages.length === 0) {
          setMessages([{ role: 'assistant', content: data.welcomeMessage }]);
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          systemPrompt: config?.systemPrompt || 'You are an Ayurvedic wellness guide.'
        })
      });

      const data = await response.json();
      if (data.content) {
        setMessages([...newMessages, { role: 'assistant', content: data.content }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Oops! Something went wrong.' }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Failed to connect. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!config || !config.enabled) return null;

  // Dynamic style values from config
  const primaryColor = config.primaryColor || '#1a1a1a';
  const accentColor = config.accentColor || '#C6A55C';
  const bgColor = config.backgroundColor || '#FAF9F6';
  const userBubble = config.userBubbleColor || '#C6A55C';
  const botBubble = config.botBubbleColor || '#FFFFFF';
  const fontFamily = config.fontFamily || 'inherit';
  const borderRadius = Number(config.borderRadius || 16);
  const widgetSize = Number(config.widgetSize || 60);
  const headerTitle = config.headerTitle || 'Ayurvedic Guide';
  const showFooter = config.showBrandingFooter !== false;
  const position = config.position || 'bottom-right';

  const positionClasses = position === 'bottom-left' 
    ? 'fixed bottom-6 left-6 z-50' 
    : 'fixed bottom-6 right-6 z-50';

  const chatAlign = position === 'bottom-left'
    ? 'absolute bottom-0 left-0'
    : 'absolute bottom-0 right-0';

  return (
    <>
      <div className={positionClasses} style={{ fontFamily }}>
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setIsOpen(true)}
              className="rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center relative group"
              style={{ 
                backgroundColor: primaryColor, 
                width: `${widgetSize}px`, 
                height: `${widgetSize}px` 
              }}
            >
              {config.avatarUrl ? (
                <img 
                  src={config.avatarUrl} 
                  alt="Chatbot" 
                  className="rounded-full object-cover" 
                  style={{ width: `${widgetSize - 16}px`, height: `${widgetSize - 16}px` }}
                />
              ) : (
                <MessageSquare className="w-6 h-6 text-white" />
              )}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: accentColor }}></span>
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: accentColor }}></span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`${chatAlign} w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] shadow-2xl flex flex-col overflow-hidden`}
              style={{ 
                borderRadius: `${borderRadius}px`,
                border: `1px solid ${accentColor}33`
              }}
            >
              {/* Header */}
              <div 
                className="p-4 flex items-center justify-between"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center space-x-3">
                  {config.avatarUrl ? (
                    <img 
                      src={config.avatarUrl} 
                      alt="Doctor" 
                      className="w-10 h-10 rounded-full object-cover"
                      style={{ border: `2px solid ${accentColor}` }}
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${accentColor}33` }}
                    >
                      <Bot className="w-6 h-6" style={{ color: accentColor }} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif text-sm text-white">{headerTitle}</h3>
                    <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-[10px] uppercase tracking-widest text-white/70">Online</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Area */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ backgroundColor: bgColor }}
              >
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className="max-w-[85%] px-4 py-3 text-sm"
                      style={msg.role === 'user' 
                        ? { 
                            backgroundColor: userBubble, 
                            color: '#ffffff',
                            borderRadius: `${borderRadius}px`,
                            borderBottomRightRadius: '4px'
                          } 
                        : { 
                            backgroundColor: botBubble, 
                            color: '#1a1a1a',
                            border: `1px solid ${accentColor}1A`,
                            borderRadius: `${borderRadius}px`,
                            borderBottomLeftRadius: '4px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }
                      }
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div 
                      className="px-4 py-3 flex space-x-2 items-center"
                      style={{ 
                        backgroundColor: botBubble,
                        border: `1px solid ${accentColor}1A`,
                        borderRadius: `${borderRadius}px`,
                        borderBottomLeftRadius: '4px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${accentColor}80` }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${accentColor}80`, animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${accentColor}80`, animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white" style={{ borderTop: `1px solid ${accentColor}1A` }}>
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 rounded-full px-4 py-2.5 text-sm focus:outline-none"
                    style={{ 
                      backgroundColor: bgColor,
                      border: `1px solid ${accentColor}33`,
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-2.5 rounded-full transition-colors disabled:opacity-50"
                    style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                {showFooter && (
                  <div className="text-center mt-2">
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-sans">AI responses are for reference only</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

