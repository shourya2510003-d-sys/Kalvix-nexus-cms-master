'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);

    // Apply class names to html if needed for styling hook
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full bg-transparent border border-gold-primary/20 flex items-center justify-center opacity-50">
        <span className="w-4 h-4 rounded-full bg-gold-primary/20 animate-pulse" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 border border-gold-primary/20 bg-bg-card rounded-full text-gold-primary hover:bg-gold-primary/10 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-gold-primary/50"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform duration-500 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-500 rotate-0 hover:rotate-12" />
      )}
    </button>
  );
}
