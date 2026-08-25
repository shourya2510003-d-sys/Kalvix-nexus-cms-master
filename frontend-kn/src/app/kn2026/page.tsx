'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ref, get, push, set } from 'firebase/database';
import { db, cleanupLoginLogs } from '@/lib/firebase';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const adminSession = localStorage.getItem('adminAuth');
    if (adminSession) {
      router.push('/kn2026/dashboard');
    }

    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const form = document.getElementById('admin-login-form') as HTMLFormElement;
        if (form) form.requestSubmit();
      }
    };
    window.addEventListener('keydown', handleGlobalEnter);
    return () => window.removeEventListener('keydown', handleGlobalEnter);
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const logLogin = async (role: string, userIdentifier: string) => {
        try {
          let ip = 'Unknown';
          try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            ip = data.ip;
          } catch (e) {
            console.error('Could not fetch IP', e);
          }
          const logRef = push(ref(db, 'logs/logins'));
          await set(logRef, {
            role,
            username: userIdentifier,
            ip,
            timestamp: new Date().toISOString()
          });
          await cleanupLoginLogs();
        } catch (err) {
          console.error('Error logging login', err);
        }
      };

      // Handle Admin Login
      const snapshot = await get(ref(db, 'admin'));
      const adminData = snapshot.val();

      if (adminData && username === adminData.username && password === adminData.password) {
        localStorage.setItem('adminAuth', 'true');
        logLogin('Admin', username);
        router.push('/kn2026/dashboard');
      } else if (!adminData && username === 'admin' && password === 'ram') {
        // Fallback for unseeded database
        localStorage.setItem('adminAuth', 'true');
        logLogin('Admin', username);
        router.push('/kn2026/dashboard');
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary relative overflow-hidden" style={{ perspective: '1200px' }}>
      {/* Background Glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-glow rounded-full blur-[120px] pointer-events-none" 
      />
      
      <motion.div 
        initial={{ opacity: 0, rotateX: 45, rotateY: -45, z: -800, scale: 0.8 }}
        animate={{ opacity: 1, rotateX: 0, rotateY: 0, z: 0, scale: 1 }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }} // smooth, slow ease out
        whileHover={{ rotateX: 2, rotateY: -2, transition: { duration: 0.5 } }}
        className="w-full max-w-md bg-bg-card/90 border border-gold-primary/30 rounded-2xl p-8 backdrop-blur-2xl relative z-10 shadow-[30px_30px_80px_rgba(0,0,0,0.9),-10px_-10px_30px_rgba(212,175,55,0.08)]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-primary to-transparent" style={{ transform: 'translateZ(10px)' }} />
        
        <Link href="/" className="absolute top-4 right-4 text-text-muted hover:text-gold-primary transition-colors p-2 z-20 hover:bg-gold-primary/10 rounded-full" style={{ transform: 'translateZ(30px)' }}>
          <X size={20} />
        </Link>
        
        <div className="flex flex-col items-center mb-8" style={{ transformStyle: 'preserve-3d' }}>
          <motion.div
            initial={{ y: -150, opacity: 0, translateZ: 100 }}
            animate={{ y: 0, opacity: 1, translateZ: 50 }}
            transition={{ duration: 1.5, delay: 1.0, type: 'spring', bounce: 0.3 }}
          >
            <Link href="/" className="mb-6 block hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Kalvix Nexus" width={72} height={72} className="object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]" />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ scale: 0, rotate: -270, opacity: 0, translateZ: 150 }}
            animate={{ scale: 1, rotate: 0, opacity: 1, translateZ: 60 }}
            transition={{ duration: 1.5, delay: 1.5, type: 'spring', bounce: 0.4 }}
            className="w-16 h-16 rounded-full bg-gold-primary/10 border border-gold-primary/40 flex items-center justify-center mb-4 relative shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          >
            <ShieldCheck size={28} className="text-gold-primary" />
            <div className="absolute inset-0 rounded-full border border-gold-primary/60 animate-ping opacity-30" />
          </motion.div>

          <motion.h1 
            initial={{ x: 150, opacity: 0, translateZ: 120 }}
            animate={{ x: 0, opacity: 1, translateZ: 40 }}
            transition={{ duration: 1.2, delay: 2.0 }}
            className="font-orbitron font-black text-2xl text-text-primary tracking-widest uppercase drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)]"
          >
            {"Admin Login".split('').map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1, delay: 2.8 + index * 0.15 }}
              >
                {char}
              </motion.span>
            ))}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 2.8 }}
              className="inline-block w-3 h-5 bg-gold-primary ml-1 align-middle opacity-0"
            />
          </motion.h1>

          <motion.p 
            initial={{ x: -150, opacity: 0, translateZ: 80 }}
            animate={{ x: 0, opacity: 1, translateZ: 30 }}
            transition={{ duration: 1.2, delay: 2.3 }}
            className="text-text-muted text-xs mt-2 text-center"
          >
            Enter your admin credentials to access the dashboard.
          </motion.p>
        </div>

        {error && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, translateZ: 60 }}
            animate={{ scale: 1, opacity: 1, translateZ: 60 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]"
          >
            <AlertCircle className="text-red-400 shrink-0" size={18} />
            <p className="text-xs text-red-400 font-rajdhani">{error}</p>
          </motion.div>
        )}

        <form id="admin-login-form" onSubmit={handleLogin} className="space-y-6" style={{ transformStyle: 'preserve-3d' }}>
          <motion.div
            initial={{ x: -200, opacity: 0, rotateY: -45, translateZ: 100 }}
            animate={{ x: 0, opacity: 1, rotateY: 0, translateZ: 40 }}
            transition={{ duration: 1.5, delay: 2.8, type: 'spring', bounce: 0.3 }}
          >
            <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2 drop-shadow-md">
              Username
            </label>
            <input
              type="text"
              required
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-bg-surface border border-gold-primary/30 rounded-xl px-4 py-3.5 text-sm text-text-primary focus:border-gold-primary outline-none transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            />
          </motion.div>

          <motion.div
            initial={{ x: 200, opacity: 0, rotateY: 45, translateZ: 100 }}
            animate={{ x: 0, opacity: 1, rotateY: 0, translateZ: 40 }}
            transition={{ duration: 1.5, delay: 3.2, type: 'spring', bounce: 0.3 }}
          >
            <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2 drop-shadow-md">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(e as any) }}
              className="w-full bg-bg-surface border border-gold-primary/30 rounded-xl px-4 py-3.5 text-sm text-text-primary focus:border-gold-primary outline-none transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            />
          </motion.div>

          <motion.button
            initial={{ y: 150, opacity: 0, rotateX: 45, translateZ: 120 }}
            animate={{ y: 0, opacity: 1, rotateX: 0, translateZ: 50 }}
            transition={{ duration: 1.5, delay: 3.8, type: 'spring', bounce: 0.4 }}
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05, translateZ: 80 }}
            whileTap={{ scale: 0.95, translateZ: 20 }}
            className="w-full flex items-center justify-center gap-2 bg-gold-primary text-black font-rajdhani font-black tracking-widest uppercase px-6 py-4.5 rounded-xl hover:bg-gold-light transition-all duration-300 mt-4 disabled:opacity-50 shadow-[0_15px_30px_rgba(212,175,55,0.4)] hover:shadow-[0_20px_40px_rgba(212,175,55,0.6)]"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Login to Dashboard'}
          </motion.button>
        </form>
        
        <motion.div 
          initial={{ opacity: 0, translateZ: 20 }}
          animate={{ opacity: 1, translateZ: 20 }}
          transition={{ duration: 1.5, delay: 4.5 }}
          className="mt-8 text-center"
        >
          <Link href="/" className="text-xs font-rajdhani text-text-muted hover:text-gold-primary transition-colors tracking-wide drop-shadow-sm">
            &larr; Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
