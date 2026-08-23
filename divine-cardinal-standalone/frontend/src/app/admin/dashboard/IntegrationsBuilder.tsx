'use client';

import React, { useState, useEffect } from 'react';
import { db, ref, set, onValue } from '../../../lib/firebase';
import { Save, Bot, Link2 } from 'lucide-react';

export default function IntegrationsBuilder() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'razorpay' | 'delhivery' | 'whatsapp' | 'make' | 'chatbot'>('razorpay');

  const [makeConfig, setMakeConfig] = useState<any>({
    webhookUrl: '',
    enabled: false
  });

  const [razorpayConfig, setRazorpayConfig] = useState<any>({
    keyId: '',
    keySecret: '',
    enabled: false
  });

  const [delhiveryConfig, setDelhiveryConfig] = useState<any>({
    apiKey: '',
    isSandbox: true,
    enabled: false
  });

  const [whatsappConfig, setWhatsappConfig] = useState<any>({
    phoneId: '',
    accessToken: '',
    enabled: false
  });

  const [chatbotConfig, setChatbotConfig] = useState<any>({
    enabled: false,
    systemPrompt: 'You are an Ayurvedic Doctor for Divine Cardinal, a luxury wellness brand. Provide holistic and natural remedies.',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    welcomeMessage: 'Namaste. I am your Ayurvedic wellness guide. How may I assist you today?',
    // UI Customization
    headerTitle: 'Ayurvedic Guide',
    position: 'bottom-right',
    primaryColor: '#1a1a1a',
    accentColor: '#C6A55C',
    backgroundColor: '#FAF9F6',
    userBubbleColor: '#C6A55C',
    botBubbleColor: '#FFFFFF',
    fontFamily: 'inherit',
    borderRadius: '16',
    widgetSize: '60',
    showBrandingFooter: true,
  });

  useEffect(() => {
    const makeRef = ref(db, 'integrations/make');
    const chatbotRef = ref(db, 'integrations/chatbot');
    const razorpayRef = ref(db, 'integrations/razorpay');
    const delhiveryRef = ref(db, 'integrations/delhivery');
    const whatsappRef = ref(db, 'integrations/whatsapp');

    let makeDone = false;
    let chatbotDone = false;
    const checkDone = () => { if (makeDone && chatbotDone) setLoading(false); };

    const unsubMake = onValue(makeRef, (snapshot) => {
      if (snapshot.exists()) setMakeConfig(snapshot.val());
      makeDone = true;
      checkDone();
    });

    const unsubChatbot = onValue(chatbotRef, (snapshot) => {
      if (snapshot.exists()) setChatbotConfig(snapshot.val());
      chatbotDone = true;
      checkDone();
    });

    const unsubRazorpay = onValue(razorpayRef, (snapshot) => {
      if (snapshot.exists()) setRazorpayConfig(snapshot.val());
    });
    const unsubDelhivery = onValue(delhiveryRef, (snapshot) => {
      if (snapshot.exists()) setDelhiveryConfig(snapshot.val());
    });
    const unsubWhatsapp = onValue(whatsappRef, (snapshot) => {
      if (snapshot.exists()) setWhatsappConfig(snapshot.val());
    });
    
    const timeout = setTimeout(() => setLoading(false), 2000);

    return () => {
      unsubMake();
      unsubChatbot();
      unsubRazorpay();
      unsubDelhivery();
      unsubWhatsapp();
      clearTimeout(timeout);
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'make') {
        await set(ref(db, 'integrations/make'), makeConfig);
      } else if (activeTab === 'chatbot') {
        await set(ref(db, 'integrations/chatbot'), chatbotConfig);
      } else if (activeTab === 'razorpay') {
        await set(ref(db, 'integrations/razorpay'), razorpayConfig);
      } else if (activeTab === 'delhivery') {
        await set(ref(db, 'integrations/delhivery'), delhiveryConfig);
      } else if (activeTab === 'whatsapp') {
        await set(ref(db, 'integrations/whatsapp'), whatsappConfig);
      }
      alert('Integration settings saved!');
    } catch (error) {
      console.error(error);
      alert('Failed to save settings.');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Integrations...</div>;

  return (
    <div className="space-y-6 text-left pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-300 pb-4 gap-4 sticky top-0 bg-[#F1F1F1] z-10 py-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#1A1A1A]">Integrations</h1>
          <p className="text-xs text-gray-500 mt-1">Connect third-party apps and AI services.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#008060] hover:bg-[#006e52] text-white px-5 py-2 rounded text-sm font-semibold shadow flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto pb-1">
        <button 
          onClick={() => setActiveTab('razorpay')}
          className={`pb-2 px-1 text-sm font-medium whitespace-nowrap ${activeTab === 'razorpay' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Razorpay
        </button>
        <button 
          onClick={() => setActiveTab('delhivery')}
          className={`pb-2 px-1 text-sm font-medium whitespace-nowrap ${activeTab === 'delhivery' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Delhivery
        </button>
        <button 
          onClick={() => setActiveTab('whatsapp')}
          className={`pb-2 px-1 text-sm font-medium whitespace-nowrap ${activeTab === 'whatsapp' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          WhatsApp (Meta)
        </button>
        <button 
          onClick={() => setActiveTab('make')}
          className={`pb-2 px-1 text-sm font-medium whitespace-nowrap flex items-center space-x-2 ${activeTab === 'make' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Link2 className="w-4 h-4" />
          <span>Make.com (Webhooks)</span>
        </button>
        <button 
          onClick={() => setActiveTab('chatbot')}
          className={`pb-2 px-1 text-sm font-medium whitespace-nowrap flex items-center space-x-2 ${activeTab === 'chatbot' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Chatbot</span>
        </button>
      </div>

      {activeTab === 'razorpay' && (
        <div className="space-y-6 bg-white p-6 rounded border border-gray-200 shadow-sm max-w-3xl">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h3 className="font-bold text-[#1A1A1A]">Razorpay Integration</h3>
              <p className="text-xs text-gray-500">Accept secure payments via Razorpay.</p>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-sm font-medium">Enable</span>
              <input 
                type="checkbox" 
                checked={razorpayConfig.enabled}
                onChange={(e) => setRazorpayConfig({ ...razorpayConfig, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#008060]"
              />
            </label>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Key ID</label>
            <input 
              type="text" 
              value={razorpayConfig.keyId}
              onChange={(e) => setRazorpayConfig({ ...razorpayConfig, keyId: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Key Secret</label>
            <input 
              type="password" 
              value={razorpayConfig.keySecret}
              onChange={(e) => setRazorpayConfig({ ...razorpayConfig, keySecret: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
            />
          </div>
        </div>
      )}

      {activeTab === 'delhivery' && (
        <div className="space-y-6 bg-white p-6 rounded border border-gray-200 shadow-sm max-w-3xl">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h3 className="font-bold text-[#1A1A1A]">Delhivery Logistics</h3>
              <p className="text-xs text-gray-500">Automate shipping and generate AWBs.</p>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-sm font-medium">Enable</span>
              <input 
                type="checkbox" 
                checked={delhiveryConfig.enabled}
                onChange={(e) => setDelhiveryConfig({ ...delhiveryConfig, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#008060]"
              />
            </label>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Delhivery API Key</label>
            <input 
              type="password" 
              value={delhiveryConfig.apiKey}
              onChange={(e) => setDelhiveryConfig({ ...delhiveryConfig, apiKey: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
            />
          </div>
          <label className="flex items-center space-x-2 cursor-pointer pt-2">
            <input 
              type="checkbox" 
              checked={delhiveryConfig.isSandbox}
              onChange={(e) => setDelhiveryConfig({ ...delhiveryConfig, isSandbox: e.target.checked })}
              className="w-4 h-4 accent-[#008060]"
            />
            <span className="text-sm font-medium">Use Sandbox (Test Mode)</span>
          </label>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div className="space-y-6 bg-white p-6 rounded border border-gray-200 shadow-sm max-w-3xl">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h3 className="font-bold text-[#1A1A1A]">WhatsApp Chat Widget</h3>
              <p className="text-xs text-gray-500">Enable a floating WhatsApp icon for customers to chat with you.</p>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-sm font-medium">Enable</span>
              <input 
                type="checkbox" 
                checked={whatsappConfig.enabled}
                onChange={(e) => setWhatsappConfig({ ...whatsappConfig, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#008060]"
              />
            </label>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">WhatsApp Phone Number (with country code, e.g. 919876543210)</label>
            <input 
              type="text" 
              value={whatsappConfig.phoneNumber || whatsappConfig.phoneId || ''}
              onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phoneNumber: e.target.value, phoneId: e.target.value })}
              placeholder="919876543210"
              className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
            />
          </div>
        </div>
      )}

      {activeTab === 'make' && (
        <div className="space-y-6 bg-white p-6 rounded border border-gray-200 shadow-sm max-w-3xl">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h3 className="font-bold text-[#1A1A1A]">Make.com Webhook</h3>
              <p className="text-xs text-gray-500">Send order data to Make.com when a new order is placed.</p>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-sm font-medium">Enable</span>
              <input 
                type="checkbox" 
                checked={makeConfig.enabled}
                onChange={(e) => setMakeConfig({ ...makeConfig, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#008060]"
              />
            </label>
          </div>
          
          <div>
            <label className="text-xs font-semibold block mb-1">Webhook URL</label>
            <input 
              type="text" 
              placeholder="https://hook.us1.make.com/..."
              value={makeConfig.webhookUrl}
              onChange={(e) => setMakeConfig({ ...makeConfig, webhookUrl: e.target.value })}
              className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
            />
            <p className="text-xs text-gray-500 mt-2">
              Whenever a customer successfully places an order, we will send a POST request with the order JSON data to this URL.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'chatbot' && (
        <div className="space-y-6 bg-white p-6 rounded border border-gray-200 shadow-sm max-w-4xl">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h3 className="font-bold text-[#1A1A1A]">Premium AI Chatbot</h3>
              <p className="text-xs text-gray-500">Configure the floating Ayurvedic Doctor AI assistant.</p>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-sm font-medium">Enable Chatbot</span>
              <input 
                type="checkbox" 
                checked={chatbotConfig.enabled}
                onChange={(e) => setChatbotConfig({ ...chatbotConfig, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#008060]"
              />
            </label>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Settings */}
            <div className="space-y-5">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b pb-2">💬 Content Settings</h4>
              <div>
                <label className="text-xs font-semibold block mb-1">System Prompt (Instructions for AI)</label>
                <textarea 
                  rows={4}
                  value={chatbotConfig.systemPrompt}
                  onChange={(e) => setChatbotConfig({ ...chatbotConfig, systemPrompt: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Welcome Message</label>
                <input 
                  type="text" 
                  value={chatbotConfig.welcomeMessage}
                  onChange={(e) => setChatbotConfig({ ...chatbotConfig, welcomeMessage: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Header Title</label>
                <input 
                  type="text" 
                  value={chatbotConfig.headerTitle || 'Ayurvedic Guide'}
                  onChange={(e) => setChatbotConfig({ ...chatbotConfig, headerTitle: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Avatar Image URL</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="text" 
                    value={chatbotConfig.avatarUrl}
                    onChange={(e) => setChatbotConfig({ ...chatbotConfig, avatarUrl: e.target.value })}
                    className="flex-1 border border-gray-300 rounded p-2 text-sm"
                  />
                  {chatbotConfig.avatarUrl && (
                    <img src={chatbotConfig.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-gray-300" />
                  )}
                </div>
              </div>

              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b pb-2 pt-4">🎨 UI Customization</h4>
              
              <div>
                <label className="text-xs font-semibold block mb-1">Widget Position</label>
                <select
                  value={chatbotConfig.position || 'bottom-right'}
                  onChange={(e) => setChatbotConfig({ ...chatbotConfig, position: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Primary Color (Header/Button)</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="color" 
                      value={chatbotConfig.primaryColor || '#1a1a1a'}
                      onChange={(e) => setChatbotConfig({ ...chatbotConfig, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={chatbotConfig.primaryColor || '#1a1a1a'}
                      onChange={(e) => setChatbotConfig({ ...chatbotConfig, primaryColor: e.target.value })}
                      className="flex-1 border border-gray-300 rounded p-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Accent Color (Gold/Brand)</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="color" 
                      value={chatbotConfig.accentColor || '#C6A55C'}
                      onChange={(e) => setChatbotConfig({ ...chatbotConfig, accentColor: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={chatbotConfig.accentColor || '#C6A55C'}
                      onChange={(e) => setChatbotConfig({ ...chatbotConfig, accentColor: e.target.value })}
                      className="flex-1 border border-gray-300 rounded p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Chat Background</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="color" 
                      value={chatbotConfig.backgroundColor || '#FAF9F6'}
                      onChange={(e) => setChatbotConfig({ ...chatbotConfig, backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={chatbotConfig.backgroundColor || '#FAF9F6'}
                      onChange={(e) => setChatbotConfig({ ...chatbotConfig, backgroundColor: e.target.value })}
                      className="flex-1 border border-gray-300 rounded p-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">User Bubble Color</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="color" 
                      value={chatbotConfig.userBubbleColor || '#C6A55C'}
                      onChange={(e) => setChatbotConfig({ ...chatbotConfig, userBubbleColor: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={chatbotConfig.userBubbleColor || '#C6A55C'}
                      onChange={(e) => setChatbotConfig({ ...chatbotConfig, userBubbleColor: e.target.value })}
                      className="flex-1 border border-gray-300 rounded p-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Bot Bubble Color</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="color" 
                      value={chatbotConfig.botBubbleColor || '#FFFFFF'}
                      onChange={(e) => setChatbotConfig({ ...chatbotConfig, botBubbleColor: e.target.value })}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={chatbotConfig.botBubbleColor || '#FFFFFF'}
                      onChange={(e) => setChatbotConfig({ ...chatbotConfig, botBubbleColor: e.target.value })}
                      className="flex-1 border border-gray-300 rounded p-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Font Family</label>
                  <select
                    value={chatbotConfig.fontFamily || 'inherit'}
                    onChange={(e) => setChatbotConfig({ ...chatbotConfig, fontFamily: e.target.value })}
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                  >
                    <option value="inherit">Default (Brand Font)</option>
                    <option value="'Inter', sans-serif">Inter</option>
                    <option value="'Poppins', sans-serif">Poppins</option>
                    <option value="'Playfair Display', serif">Playfair Display</option>
                    <option value="system-ui, sans-serif">System UI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Border Radius (px)</label>
                  <input 
                    type="range" 
                    min="0" max="30" step="2"
                    value={chatbotConfig.borderRadius || '16'}
                    onChange={(e) => setChatbotConfig({ ...chatbotConfig, borderRadius: e.target.value })}
                    className="w-full accent-[#008060]"
                  />
                  <span className="text-xs text-gray-500">{chatbotConfig.borderRadius || 16}px</span>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Floating Button Size (px)</label>
                  <input 
                    type="range" 
                    min="40" max="80" step="4"
                    value={chatbotConfig.widgetSize || '60'}
                    onChange={(e) => setChatbotConfig({ ...chatbotConfig, widgetSize: e.target.value })}
                    className="w-full accent-[#008060]"
                  />
                  <span className="text-xs text-gray-500">{chatbotConfig.widgetSize || 60}px</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <label className="text-xs font-semibold">Show "AI responses are for reference only" footer</label>
                <input 
                  type="checkbox" 
                  checked={chatbotConfig.showBrandingFooter !== false}
                  onChange={(e) => setChatbotConfig({ ...chatbotConfig, showBrandingFooter: e.target.checked })}
                  className="w-4 h-4 accent-[#008060]"
                />
              </div>
            </div>

            {/* Right Column - Live Preview */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b pb-2 mb-4">👁️ Live Preview</h4>
              <div className="bg-gray-100 rounded-xl p-4 flex items-end justify-end min-h-[500px] relative">
                {/* Mini chat window preview */}
                <div 
                  className="w-[280px] shadow-2xl flex flex-col overflow-hidden"
                  style={{ 
                    borderRadius: `${chatbotConfig.borderRadius || 16}px`,
                    fontFamily: chatbotConfig.fontFamily || 'inherit'
                  }}
                >
                  {/* Header */}
                  <div 
                    className="p-3 flex items-center space-x-3"
                    style={{ backgroundColor: chatbotConfig.primaryColor || '#1a1a1a' }}
                  >
                    {chatbotConfig.avatarUrl ? (
                      <img src={chatbotConfig.avatarUrl} className="w-8 h-8 rounded-full object-cover border-2" style={{ borderColor: chatbotConfig.accentColor || '#C6A55C' }} />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${chatbotConfig.accentColor || '#C6A55C'}33` }}>
                        <span style={{ color: chatbotConfig.accentColor || '#C6A55C' }}>🤖</span>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-white">{chatbotConfig.headerTitle || 'Ayurvedic Guide'}</p>
                      <div className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        <span className="text-[9px] text-white/60 uppercase tracking-widest">Online</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat body */}
                  <div className="p-3 space-y-3 min-h-[200px]" style={{ backgroundColor: chatbotConfig.backgroundColor || '#FAF9F6' }}>
                    {/* Bot message */}
                    <div className="flex justify-start">
                      <div 
                        className="max-w-[85%] px-3 py-2 text-xs border"
                        style={{ 
                          backgroundColor: chatbotConfig.botBubbleColor || '#FFFFFF',
                          borderRadius: `${chatbotConfig.borderRadius || 16}px`,
                          borderBottomLeftRadius: '4px',
                          borderColor: `${chatbotConfig.accentColor || '#C6A55C'}22`
                        }}
                      >
                        {chatbotConfig.welcomeMessage || 'Namaste! How may I help?'}
                      </div>
                    </div>
                    {/* User message */}
                    <div className="flex justify-end">
                      <div 
                        className="max-w-[85%] px-3 py-2 text-xs text-white"
                        style={{ 
                          backgroundColor: chatbotConfig.userBubbleColor || '#C6A55C',
                          borderRadius: `${chatbotConfig.borderRadius || 16}px`,
                          borderBottomRightRadius: '4px'
                        }}
                      >
                        I need help with skincare
                      </div>
                    </div>
                    {/* Bot reply */}
                    <div className="flex justify-start">
                      <div 
                        className="max-w-[85%] px-3 py-2 text-xs border"
                        style={{ 
                          backgroundColor: chatbotConfig.botBubbleColor || '#FFFFFF',
                          borderRadius: `${chatbotConfig.borderRadius || 16}px`,
                          borderBottomLeftRadius: '4px',
                          borderColor: `${chatbotConfig.accentColor || '#C6A55C'}22`
                        }}
                      >
                        Of course! I recommend our Kumkumadi face oil for a radiant glow. ✨
                      </div>
                    </div>
                  </div>

                  {/* Input area */}
                  <div className="p-2 bg-white border-t" style={{ borderColor: `${chatbotConfig.accentColor || '#C6A55C'}22` }}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="flex-1 px-3 py-1.5 text-xs text-gray-400"
                        style={{ 
                          backgroundColor: chatbotConfig.backgroundColor || '#FAF9F6',
                          borderRadius: '9999px',
                          border: `1px solid ${chatbotConfig.accentColor || '#C6A55C'}33`
                        }}
                      >
                        Type your question...
                      </div>
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: chatbotConfig.primaryColor || '#1a1a1a' }}
                      >
                        <span className="text-white text-xs">➤</span>
                      </div>
                    </div>
                    {chatbotConfig.showBrandingFooter !== false && (
                      <p className="text-center text-[8px] text-gray-400 mt-1 uppercase tracking-widest">AI responses are for reference only</p>
                    )}
                  </div>
                </div>

                {/* Floating button preview */}
                <div 
                  className="absolute bottom-4 right-4 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                  style={{ 
                    width: `${chatbotConfig.widgetSize || 60}px`,
                    height: `${chatbotConfig.widgetSize || 60}px`,
                    backgroundColor: chatbotConfig.primaryColor || '#1a1a1a'
                  }}
                >
                  {chatbotConfig.avatarUrl ? (
                    <img src={chatbotConfig.avatarUrl} className="rounded-full object-cover" style={{ width: `${(chatbotConfig.widgetSize || 60) - 16}px`, height: `${(chatbotConfig.widgetSize || 60) - 16}px` }} />
                  ) : (
                    <span className="text-white text-lg">💬</span>
                  )}
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: chatbotConfig.accentColor || '#C6A55C' }}></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
