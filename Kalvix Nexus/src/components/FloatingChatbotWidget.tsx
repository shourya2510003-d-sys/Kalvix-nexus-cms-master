'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
  options?: string[];
};

const INITIAL_MESSAGES: Message[] = [
  { 
    id: '1', 
    role: 'ai', 
    content: 'Hello! 👋 Welcome to Kalvix Nexus. Please select your preferred language / Apni pasandida bhasha chunein:',
    options: ['English', 'Hinglish']
  }
];

// Backend API integration handled in route.ts
export default function FloatingChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Auto-focus input when chatbot opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // slight delay for animation
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, newUserMsg] }),
      });
      
      if (!response.ok) {
        throw new Error("Error connecting to AI.");
      }

      setIsTyping(false);
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '' }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let reply = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const token = data.choices[0]?.delta?.content || "";
                reply += token;
                const formattedReply = reply.replace(/\n/g, '<br/>');
                setMessages(prev => 
                  prev.map(m => m.id === aiMsgId ? { ...m, content: formattedReply } : m)
                );
              } catch (e) {}
            }
          }
        }
      }
    } catch (error: any) {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: error.message || "Sorry, I am having trouble connecting right now." }]);
    }
  };

  const handleOptionClick = (msgId: string, option: string) => {
    // Treat clicking an option just like submitting the form
    if (isTyping) return;
    
    // Remove options from the message so they disappear
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, options: undefined } : m));

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: option };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    const handleStream = async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, newUserMsg] }),
        });
        
        if (!response.ok) throw new Error();

        setIsTyping(false);
        const aiMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '' }]);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let reply = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.slice(6));
                  const token = data.choices[0]?.delta?.content || "";
                  reply += token;
                  const formattedReply = reply.replace(/\n/g, '<br/>');
                  setMessages(prev => 
                    prev.map(m => m.id === aiMsgId ? { ...m, content: formattedReply } : m)
                  );
                } catch (e) {}
              }
            }
          }
        }
      } catch (error) {
        setIsTyping(false);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: "Sorry, I am having trouble connecting right now. Please try again later!" }]);
      }
    };
    handleStream();
  };

  const handleRestart = () => {
    setMessages(INITIAL_MESSAGES);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 250, damping: 25 }}
            // Theme Opposite Logic: We use bg-text-primary and text-bg-primary
            // This guarantees it's dark when the site is light, and light when the site is dark.
            className="w-[calc(100vw-48px)] sm:w-[380px] h-[500px] max-h-[80vh] bg-text-primary text-bg-primary rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gold-primary/30 origin-bottom-right"
          >
            {/* Header */}
            <div className="p-4 border-b border-bg-primary/20 flex items-center justify-between bg-black/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-primary/20 flex items-center justify-center border border-gold-primary/50 overflow-hidden">
                  <Image src="/ai-avatar.png" alt="AI Robot" width={32} height={32} className="object-cover w-full h-full" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-sm">Kalvix AI Chatbot</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] opacity-70">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleRestart}
                  title="Restart Chat"
                  className="p-1.5 rounded-md hover:bg-bg-primary/10 transition-colors opacity-70 hover:opacity-100"
                >
                  <RotateCcw size={16} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  title="Close Chat"
                  className="p-1.5 rounded-md hover:bg-bg-primary/10 transition-colors opacity-70 hover:opacity-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-bg-primary/10 border border-bg-primary/20 mt-1 overflow-hidden">
                      {msg.role === 'user' ? <User size={12} className="opacity-70" /> : <Image src="/ai-avatar.png" alt="AI" width={24} height={24} className="object-cover w-full h-full" />}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div 
                        className={`p-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-gold-primary text-black rounded-tr-sm' 
                            : 'bg-bg-primary/10 rounded-tl-sm'
                        }`}
                        dangerouslySetInnerHTML={{ __html: msg.content }}
                      />
                      {msg.options && (
                        <div className="flex flex-col gap-2 w-full mt-1">
                          {msg.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleOptionClick(msg.id, opt)}
                              disabled={isTyping}
                              className="text-xs bg-gold-primary/10 hover:bg-gold-primary text-gold-primary hover:text-black border border-gold-primary/40 rounded-md px-4 py-2 transition-colors disabled:opacity-50 text-center w-full"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex w-full justify-start">
                  <div className="flex gap-2 max-w-[85%] flex-row">
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-bg-primary/10 border border-bg-primary/20 mt-1 overflow-hidden">
                      <Image src="/ai-avatar.png" alt="AI" width={24} height={24} className="object-cover w-full h-full" />
                    </div>
                    <div className="p-3 rounded-2xl bg-bg-primary/10 rounded-tl-sm flex items-center gap-1 h-[44px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-bg-primary/20 bg-black/10">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-transparent border border-bg-primary/30 text-inherit placeholder:text-inherit placeholder:opacity-50 rounded-full px-4 py-3 pr-12 text-sm focus:outline-none focus:border-gold-primary transition-colors"
                  disabled={isTyping}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 p-2 bg-gold-primary text-black rounded-full hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button (Only visible when chat is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-3"
          >
            {/* Tooltip */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5, type: "spring", stiffness: 200 }}
              className="bg-text-primary text-bg-primary px-4 py-2 rounded-2xl shadow-2xl relative text-xs font-bold whitespace-nowrap animate-bounce"
              style={{ animationDuration: '2s' }}
            >
              Talk to AI Chatbot
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-text-primary transform rotate-45" />
            </motion.div>

            {/* Avatar Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 flex items-center justify-center rounded-full shadow-gold-glow hover:scale-110 border-2 transition-all duration-300 bg-bg-primary border-gold-primary text-gold-primary overflow-hidden p-0"
              aria-label="Open AI Chatbot"
            >
              <Image src="/ai-avatar.png" alt="AI Avatar" width={56} height={56} className="object-cover w-full h-full" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
