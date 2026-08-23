'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { app } from '@/lib/firebase';

export default function ClientLoginPage() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const runAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(getAuth(), email, pass);
      router.push('/dashboard');
    } catch (err: any) {
      setError('Login failed. Please verify your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-primary min-h-[calc(100vh-80px)] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-10 left-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-10 right-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-15" />

      <form 
        onSubmit={runAuth} 
        className="max-w-sm w-full bg-bg-card border border-gold-primary/10 p-8 rounded-xl space-y-6 relative z-10 hover:border-gold-primary/20 transition-all duration-300"
      >
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-gold-primary/5 border border-gold-primary/20 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={20} className="text-gold-primary" />
          </div>
          <h2 className="font-orbitron font-black text-lg text-text-primary tracking-widest uppercase">
            Client Login
          </h2>
          <p className="font-rajdhani text-[11px] text-text-muted uppercase tracking-wider mt-1">
            Access your dashboard and invoices
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center gap-3 text-xs leading-relaxed">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-wider block mb-2">
              Email Address
            </label>
            <input 
              required 
              type="email" 
              id="email"
              placeholder="name@company.com" 
              className="w-full bg-bg-primary border border-gold-primary/20 rounded-lg p-3 text-xs text-text-primary focus:outline-none focus:border-gold-primary transition-colors placeholder:text-text-muted/40" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          <div>
            <label htmlFor="pass" className="text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-wider block mb-2">
              Password
            </label>
            <input 
              required 
              type="password" 
              id="pass"
              placeholder="••••••••" 
              className="w-full bg-bg-primary border border-gold-primary/20 rounded-lg p-3 text-xs text-text-primary focus:outline-none focus:border-gold-primary transition-colors placeholder:text-text-muted/40" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-gold-primary text-black font-rajdhani font-black uppercase tracking-widest rounded-lg flex items-center justify-center hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 shimmer-btn"
        >
          {loading ? 'Verifying...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}