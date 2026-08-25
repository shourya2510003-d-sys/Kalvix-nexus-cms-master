'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Loader2, Palette, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeSelectionPage() {
  const router = useRouter();
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    const name = sessionStorage.getItem('pendingStoreName');
    const plan = sessionStorage.getItem('selectedPlan');
    
    if (!name || !plan) {
      router.push('/build-store');
      return;
    }
    setStoreName(name);

    const themesRef = ref(db, 'themes');
    const unsub = onValue(themesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const themeList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setThemes(themeList);
        
        // Select first by default if available
        if (themeList.length > 0) {
          setSelectedThemeId(themeList[0].id);
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  const handleContinue = () => {
    if (!selectedThemeId) return;
    sessionStorage.setItem('selectedThemeId', selectedThemeId);
    router.push('/build-store/checkout');
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-orbitron font-black text-3xl md:text-4xl uppercase tracking-wider mb-4">
            Choose Your Theme
          </h1>
          <p className="text-text-muted text-sm max-w-xl mx-auto">
            Select the visual foundation for <strong className="text-gold-primary">{storeName}</strong>. You can completely customize this later from your Admin Panel.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gold-primary w-12 h-12" /></div>
        ) : themes.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-gold-primary/30 rounded-2xl max-w-2xl mx-auto">
            <Palette className="w-12 h-12 text-gold-primary/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Themes Available</h3>
            <p className="text-text-muted text-sm mb-6">
              Our engineers are currently deploying the theme repository. 
            </p>
            <button 
              onClick={() => {
                sessionStorage.setItem('selectedThemeId', 'default');
                router.push('/build-store/checkout');
              }}
              className="bg-gold-primary text-black px-6 py-3 rounded-lg font-rajdhani font-bold hover:shadow-[0_0_15px_rgba(212,175,55,0.5)] transition-all"
            >
              Continue with Default Setup
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {themes.map((theme, index) => {
              const isSelected = selectedThemeId === theme.id;
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={theme.id}
                  onClick={() => setSelectedThemeId(theme.id)}
                  className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    isSelected ? 'border-gold-primary shadow-[0_0_30px_rgba(212,175,55,0.2)]' : 'border-black/20 dark:border-white/10 hover:border-gold-primary/50'
                  }`}
                >
                  {/* Theme Preview Box */}
                  <div className="aspect-[4/3] bg-bg-card p-4 relative group">
                    <div 
                      className="w-full h-full rounded shadow-inner flex flex-col overflow-hidden border border-black/10 dark:border-white/5"
                      style={{ 
                        backgroundColor: theme.config?.colors?.background || '#ffffff',
                        color: theme.config?.colors?.text || '#000000'
                      }}
                    >
                       {/* Mock Header */}
                       <div 
                         className="h-8 flex items-center px-4 justify-between border-b opacity-50"
                         style={{ borderColor: theme.config?.colors?.primary || '#cccccc' }}
                       >
                         <div className="w-16 h-3 rounded" style={{ backgroundColor: theme.config?.colors?.primary || '#000000' }}></div>
                         <div className="flex gap-2">
                           <div className="w-8 h-2 rounded bg-current opacity-30"></div>
                           <div className="w-8 h-2 rounded bg-current opacity-30"></div>
                         </div>
                       </div>
                       
                       {/* Mock Hero */}
                       <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                          <div className="w-3/4 h-6 rounded mb-3" style={{ backgroundColor: theme.config?.colors?.primary || '#000000' }}></div>
                          <div className="w-1/2 h-3 rounded bg-current opacity-40 mb-6"></div>
                          <div 
                            className="px-6 py-2 rounded text-[10px] font-bold" 
                            style={{ 
                              backgroundColor: theme.config?.colors?.primary || '#000000',
                              color: theme.config?.colors?.background || '#ffffff'
                            }}
                          >
                            SHOP NOW
                          </div>
                       </div>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute top-4 right-4 bg-gold-primary text-black rounded-full p-1 z-10 shadow-lg">
                        <CheckCircle2 size={20} className="fill-gold-primary text-black" />
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-6 ${isSelected ? 'bg-gold-primary/5' : 'bg-bg-card'}`}>
                    <h3 className="font-orbitron font-bold text-xl uppercase mb-1">{theme.name}</h3>
                    <p className="text-text-muted text-xs">Version {theme.version}</p>
                    
                    <div className="mt-4 flex gap-2">
                       <span className="w-6 h-6 rounded-full border border-black/20" style={{ backgroundColor: theme.config?.colors?.primary || '#D4AF37' }}></span>
                       <span className="w-6 h-6 rounded-full border border-black/20" style={{ backgroundColor: theme.config?.colors?.background || '#ffffff' }}></span>
                       <span className="w-6 h-6 rounded-full border border-black/20" style={{ backgroundColor: theme.config?.colors?.text || '#000000' }}></span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {themes.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              disabled={!selectedThemeId}
              className="bg-gold-primary text-black font-rajdhani font-black text-xl px-12 py-4 rounded-full uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
