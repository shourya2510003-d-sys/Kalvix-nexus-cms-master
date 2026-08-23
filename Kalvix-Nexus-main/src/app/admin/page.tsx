'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const snapshot = await get(ref(db, 'admin'));
      const adminData = snapshot.val();

      if (adminData && username === adminData.username && password === adminData.password) {
        localStorage.setItem('adminAuth', 'true');
        router.push('/admin/dashboard');
      } else if (!adminData && username === 'admin' && password === 'ram') {
        // Fallback for unseeded database
        localStorage.setItem('adminAuth', 'true');
        router.push('/admin/dashboard');
      } else {
        setError('Invalid admin credentials.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Database connection failed. Check your Firebase config.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-bg-primary min-h-screen flex items-center justify-center relative overflow-hidden px-6">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gold-glow rounded-full blur-[150px] pointer-events-none opacity-20" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-gold-glow rounded-full blur-[150px] pointer-events-none opacity-20" />

      <div className="w-full max-w-md z-10">
        <div className="bg-bg-card border border-gold-primary/20 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-primary to-transparent" />
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center mb-4 relative">
              <Lock size={24} className="text-gold-primary" />
              {/* Ping effect */}
              <div className="absolute inset-0 rounded-full border border-gold-primary/50 animate-ping opacity-20" />
            </div>
            <h1 className="font-orbitron font-black text-2xl text-text-primary tracking-wide uppercase">Admin Nexus</h1>
            <p className="text-text-muted text-xs mt-2 text-center">Authorized personnel only. Authenticate to access the control panel.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3 animate-fade-in">
              <ShieldAlert size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs font-mono">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="font-rajdhani text-xs font-bold text-text-muted tracking-widest uppercase block mb-2">Username</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <User size={16} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-bg-surface border border-gold-primary/10 rounded-lg py-3 pl-10 pr-4 text-sm text-text-primary focus:border-gold-primary/50 focus:outline-none transition-colors"
                  placeholder="Enter admin username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-rajdhani text-xs font-bold text-text-muted tracking-widest uppercase block mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <Lock size={16} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg-surface border border-gold-primary/10 rounded-lg py-3 pl-10 pr-4 text-sm text-text-primary focus:border-gold-primary/50 focus:outline-none transition-colors"
                  placeholder="Enter admin password"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gold-primary hover:bg-gold-light text-black font-rajdhani font-bold text-sm tracking-widest uppercase py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Access Control Panel'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
