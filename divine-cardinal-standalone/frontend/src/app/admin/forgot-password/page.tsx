'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

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
            Password Recovery
          </span>
          <div className="w-12 h-[1px] bg-luxury-gold/30 mt-4" />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 border border-luxury-gold/15 rounded-lg shadow-2xl min-h-[300px] flex flex-col justify-center">
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Link
              href="/admin/login"
              className="inline-flex items-center space-x-1.5 text-gray-500 hover:text-black text-[10px] uppercase tracking-wider"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to login</span>
            </Link>

            {!success ? (
              <>
                <div className="text-center space-y-1">
                  <h2 className="font-serif text-lg text-luxury-charcoal tracking-wide">Reset Password</h2>
                  <p className="text-[10px] text-gray-500 font-sans font-light mt-2 px-4 leading-relaxed">
                    Enter the email address associated with your admin account and we'll send you a link to reset your password.
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
                      Admin Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-luxury-gold/60" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        <span>Sending Link...</span>
                      ) : (
                        <>
                          <Sparkles className="h-4.5 w-4.5 text-luxury-gold" />
                          <span>Send Reset Link</span>
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
                  <h3 className="font-serif text-lg text-luxury-charcoal mb-2">Check your email</h3>
                  <p className="text-[11px] text-gray-500 font-sans font-light leading-relaxed max-w-[280px] mx-auto">
                    We've sent a password reset link to <span className="font-medium text-gray-900">{email}</span>. Please check your inbox and spam folder.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
