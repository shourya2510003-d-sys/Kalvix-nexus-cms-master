'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function CustomerAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I am the Divine Cardinal Shopping Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
      const res = await fetch(`${API_URL}/customer-ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages.slice(-5) }) // Send last 5 for context
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I encountered an error.' }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error communicating with AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-luxury-gold text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-50 ${isOpen ? 'hidden' : ''}`}
      >
        <img src="/ai-logo.jpg" alt="AI" className="w-7 h-7 object-contain rounded-full" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white border border-gray-200 shadow-2xl flex flex-col z-50 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-luxury-charcoal text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <img src="/ai-logo.jpg" alt="AI" className="w-8 h-8 mr-2 object-contain rounded-full border border-luxury-gold" />
              <div>
                <h3 className="font-serif font-bold text-sm tracking-widest">AI SHOPPING ASSISTANT</h3>
                <p className="text-[10px] text-gray-400">Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-luxury-gold text-white rounded-br-none' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-3 rounded-lg rounded-bl-none shadow-sm flex items-center text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="Ask about products, orders..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-luxury-gold text-white rounded-full flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              <button onClick={() => setInput('Track my order')} className="whitespace-nowrap text-[10px] border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50">Track Order</button>
              <button onClick={() => setInput('Recommend skincare')} className="whitespace-nowrap text-[10px] border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50">Recommendations</button>
              <button onClick={() => setInput('Return policy')} className="whitespace-nowrap text-[10px] border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50">Returns</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
