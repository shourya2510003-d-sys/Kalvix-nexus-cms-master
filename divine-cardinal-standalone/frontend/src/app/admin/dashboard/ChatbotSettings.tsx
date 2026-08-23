// ChatbotSettings.tsx – Admin UI to edit chatbot appearance and config

'use client';

import React, { useEffect, useState } from 'react';
import { db, ref, set, onValue } from '../../../lib/firebase';
import { Check, X } from 'lucide-react';

export default function ChatbotSettings() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing config from Firebase
  useEffect(() => {
    const chatRef = ref(db, 'integrations/chatbot');
    const unsub = onValue(chatRef, snap => {
      if (snap.exists()) {
        setConfig(snap.val());
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleChange = (field: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await set(ref(db, 'integrations/chatbot'), config);
      alert('Chatbot settings saved!');
    } catch (e) {
      console.error(e);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-luxury-charcoal">Chatbot UI Settings</h2>

      {/* Enable toggle */}
      <div className="flex items-center space-x-3">
        <label className="font-medium text-luxury-charcoal">Enable Chatbot</label>
        <input
          type="checkbox"
          checked={!!config?.enabled}
          onChange={e => handleChange('enabled', e.target.checked)}
          className="h-4 w-4 text-luxury-gold rounded"
        />
      </div>

      {/* Avatar URL */}
      <div>
        <label className="block font-medium text-luxury-charcoal mb-1">Avatar URL</label>
        <input
          type="text"
          value={config?.avatarUrl || ''}
          onChange={e => handleChange('avatarUrl', e.target.value)}
          className="w-full border border-luxury-gold/30 rounded px-3 py-2 focus:outline-none focus:border-luxury-gold"
        />
      </div>

      {/* Position selector */}
      <div>
        <label className="block font-medium text-luxury-charcoal mb-1">Widget Position</label>
        <select
          value={config?.position || 'bottom-right'}
          onChange={e => handleChange('position', e.target.value)}
          className="w-full border border-luxury-gold/30 rounded px-3 py-2 focus:outline-none focus:border-luxury-gold"
        >
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="top-right">Top Right</option>
          <option value="top-left">Top Left</option>
        </select>
      </div>

      {/* Primary color */}
      <div>
        <label className="block font-medium text-luxury-charcoal mb-1">Primary Color (hex)</label>
        <input
          type="color"
          value={config?.primaryColor || '#1a1a1a'}
          onChange={e => handleChange('primaryColor', e.target.value)}
          className="h-10 w-16 border border-luxury-gold/30 rounded"
        />
      </div>

      {/* Background color */}
      <div>
        <label className="block font-medium text-luxury-charcoal mb-1">Background Color (hex)</label>
        <input
          type="color"
          value={config?.backgroundColor || '#faf9f6'}
          onChange={e => handleChange('backgroundColor', e.target.value)}
          className="h-10 w-16 border border-luxury-gold/30 rounded"
        />
      </div>

      <div className="flex space-x-4 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-luxury-gold text-white px-4 py-2 rounded hover:bg-luxury-gold/90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : <><Check size={16} /> Save</>}
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 bg-luxury-charcoal text-white px-4 py-2 rounded hover:bg-luxury-charcoal/90"
        >
          <X size={16} /> Reset
        </button>
      </div>
    </div>
  );
}
