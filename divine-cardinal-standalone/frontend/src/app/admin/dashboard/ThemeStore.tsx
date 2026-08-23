import React, { useState } from 'react';
import { THEMES_LIBRARY } from './themes';
import { set, ref, db } from '../../../lib/firebase';
import { LayoutTemplate, Sparkles } from 'lucide-react';

export default function ThemeStore() {
  const [publishing, setPublishing] = useState<string | null>(null);

  const applyTheme = async (theme: any) => {
    if (confirm(`Are you sure you want to apply the "${theme.name}" theme? This will replace your current homepage layout.`)) {
      setPublishing(theme.id);
      try {
        await set(ref(db, 'layouts/page-home'), theme.layout);
        alert(`Theme "${theme.name}" applied successfully! Visit your live store to see the changes.`);
      } catch (err) {
        console.error(err);
        alert("Failed to apply theme.");
      }
      setPublishing(null);
    }
  };

  return (
    <div className="space-y-8 pb-20 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-300 pb-4 gap-4 sticky top-0 bg-[#F1F1F1] z-10 py-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#1A1A1A]">Theme Store</h1>
          <p className="text-xs text-gray-500 mt-1">Ready-made premium structures for your Kalvix Nexus storefront.</p>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded text-sm font-semibold flex items-center space-x-2">
          <Sparkles className="w-4 h-4" />
          <span>Request Custom Theme</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {THEMES_LIBRARY.map((theme) => (
          <div key={theme.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="relative h-48 w-full bg-gray-100 border-b border-gray-100">
              <img src={theme.thumbnail} alt={theme.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm">
                {theme.layout.length} Sections
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-[#1a1a1a]">{theme.name}</h3>
              <p className="text-sm text-gray-500 mt-2 flex-1">{theme.description}</p>
              <button 
                onClick={() => applyTheme(theme)}
                disabled={publishing !== null}
                className={`mt-6 w-full py-2.5 rounded text-sm font-bold flex items-center justify-center transition-colors ${
                  publishing === theme.id ? 'bg-gray-200 text-gray-500' : 'bg-[#008060] hover:bg-[#006e52] text-white'
                }`}
              >
                {publishing === theme.id ? (
                  'Applying...'
                ) : (
                  <>
                    <LayoutTemplate className="w-4 h-4 mr-2" />
                    Publish Theme
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
