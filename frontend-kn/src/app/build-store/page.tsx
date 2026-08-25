'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app, firestore } from '@/lib/firebase';
import { Store, ArrowRight, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BuildStorePage() {
  const router = useRouter();
  const auth = getAuth(app);
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const checkAvailability = async (name: string) => {
    if (!name) return setAvailable(null);
    setChecking(true);
    try {
      const subdomain = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const docRef = doc(firestore, 'tenants', subdomain);
      const docSnap = await getDoc(docRef);
      setAvailable(!docSnap.exists());
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Database error. Please make sure Firestore is enabled.');
      setAvailable(null);
    }
    setChecking(false);
  };

  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setStoreName(name);
    if (name.length > 2) {
       checkAvailability(name);
    } else {
       setAvailable(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (available === false) {
      setError('Store name is not available. Please choose another.');
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      
      const subdomain = storeName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      
      // Store choices in sessionStorage to pass to the next step
      sessionStorage.setItem('pendingStoreName', storeName);
      sessionStorage.setItem('pendingSubdomain', subdomain);

      router.push('/build-store/plans');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-10 left-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-bg-card border border-gold-primary/20 rounded-2xl p-8 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-primary/30">
            <Store className="text-gold-primary" size={32} />
          </div>
          <h1 className="font-orbitron font-black text-2xl text-text-primary uppercase tracking-wider">Build Your Store</h1>
          <p className="text-text-muted text-sm mt-2">Step 1: Account & Store Name</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Store Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={storeName}
                onChange={handleStoreNameChange}
                placeholder="My Awesome Shop"
                required
                className="w-full bg-bg-primary border border-gold-primary/30 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold-primary transition-colors"
              />
              <div className="absolute right-3 top-3.5">
                {checking && <span className="text-xs text-text-muted">Checking...</span>}
                {!checking && available === true && <CheckCircle2 size={18} className="text-green-500" />}
                {!checking && available === false && <XCircle size={18} className="text-red-500" />}
              </div>
            </div>
            {storeName && (
              <p className="text-[10px] text-text-muted mt-2 font-mono">
                Your store URL: <span className="text-gold-light">{storeName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'your-store'}.kalvixnexus.com</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-bg-primary border border-gold-primary/30 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-bg-primary border border-gold-primary/30 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-gold-primary transition-colors"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-text-muted hover:text-gold-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="text-red-500 text-xs text-center">{error}</div>}

          <button 
            type="submit"
            disabled={!storeName || available === false}
            className="w-full bg-gold-primary text-black font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Plans <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-text-muted">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-gold-primary hover:underline font-bold"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
