'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid password reset link. Please request a new one.');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="text-center py-6">
        <div className="bg-red-50 border-l-2 border-red-500 p-4 rounded text-xs text-red-700 font-sans mb-6 text-left">
          {error}
        </div>
        <Link href="/admin/forgot-password" className="text-xs uppercase tracking-widest text-luxury-gold hover:text-black transition-colors font-medium">
          &larr; Request New Link
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {!success ? (
        <>
          <div className="text-center space-y-1">
            <h2 className="font-serif text-lg text-luxury-charcoal tracking-wide">Create New Password</h2>
            <p className="text-[10px] text-gray-500 font-sans font-light mt-2 px-4 leading-relaxed">
              Enter a new secure password for <span className="font-medium">{email}</span>.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-2 border-red-500 p-3 rounded text-xs text-red-700 font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="space-y-1">
              <label className="font-sans font-medium text-luxury-charcoal uppercase tracking-widest text-[9px] block">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-luxury-gold/60" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-luxury-cream/35 border border-luxury-gold/20 focus:border-luxury-gold rounded-md pl-10 pr-3 py-2.5 outline-none font-sans"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-sans font-medium text-luxury-charcoal uppercase tracking-widest text-[9px] block">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-luxury-gold/60" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Retype your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-luxury-cream/35 border border-luxury-gold/20 focus:border-luxury-gold rounded-md pl-10 pr-3 py-2.5 outline-none font-sans"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white hover:bg-gray-800 py-3.5 rounded-md font-sans uppercase tracking-[0.2em] font-medium transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <Sparkles className="h-4.5 w-4.5 text-luxury-gold" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="text-center space-y-4 py-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div>
            <h3 className="font-serif text-lg text-luxury-charcoal mb-2">Password Reset Successful!</h3>
            <p className="text-[11px] text-gray-500 font-sans font-light leading-relaxed max-w-[280px] mx-auto">
              Your password has been securely updated. Redirecting you to the login page...
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-luxury-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-luxury-gold/5 via-transparent to-luxury-gold/5 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-luxury-gold/5 filter blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center flex flex-col items-center space-y-2">
          <Link href="/" className="font-serif text-3xl sm:text-4xl tracking-[0.2em] text-luxury-charcoal hover:opacity-90 transition-opacity">
            DIVINE CARDINAL
          </Link>
          <span className="text-[9px] tracking-[0.45em] uppercase text-luxury-gold font-sans font-light">
            Secure Recovery
          </span>
          <div className="w-12 h-[1px] bg-luxury-gold/30 mt-4" />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 border border-luxury-gold/15 rounded-lg shadow-2xl min-h-[350px] flex flex-col justify-center">
          <Suspense fallback={<div className="text-center text-xs text-luxury-gold animate-pulse">Loading security protocol...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
