'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loginEmployee, loginClient } from '@/actions/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNavigation = (path: string) => {
    onClose();
    router.push(path);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !password) {
      setError('Please enter both ID and Password.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // 1. Try Employee Login
      const empResult = await loginEmployee(id, password);
      if (empResult.success && empResult.employeeId) {
        localStorage.setItem('employeeSession', empResult.employeeId);
        onClose();
        window.location.href = '/employee-dashboard';
        return;
      }

      // 2. Try Client Login
      const clientResult = await loginClient(id, password);
      if (clientResult.success && clientResult.clientId) {
        localStorage.setItem('clientAuth', JSON.stringify({
          clientId: clientResult.clientId,
          companyName: clientResult.clientId,
        }));
        onClose();
        window.location.href = '/client/dashboard';
        return;
      }

      // 3. Both failed
      setError('Invalid ID or Password.');
    } catch (err) {
      console.error(err);
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ perspective: '1200px' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Background Glow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute w-[400px] h-[400px] bg-gold-glow rounded-full blur-[80px] pointer-events-none" 
          />

          <motion.div
            initial={{ opacity: 0, rotateX: 45, rotateY: -45, z: -800, scale: 0.8 }}
            animate={{ opacity: 1, rotateX: 0, rotateY: 0, z: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.3 } }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-bg-card border border-gold-primary/50 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.15),inset_0_0_20px_rgba(212,175,55,0.05)] overflow-hidden backdrop-blur-xl transform-gpu"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Top Border Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-80" />

            {/* Close Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              onClick={onClose}
              className="absolute top-4 right-4 text-text-muted hover:text-gold-primary transition-colors p-2 z-20 hover:bg-gold-primary/10 rounded-full"
            >
              <X size={20} />
            </motion.button>

            {/* Header */}
            <div className="pt-14 pb-6 px-8 text-center border-b border-gold-primary/20 relative z-10 bg-bg-card" style={{ transformStyle: 'preserve-3d' }}>
              <motion.h2 
                initial={{ y: -50, opacity: 0, translateZ: 50 }}
                animate={{ y: 0, opacity: 1, translateZ: 20 }}
                transition={{ duration: 1, delay: 0.5, type: 'spring' }}
                className="font-orbitron font-bold text-2xl text-text-primary tracking-wider uppercase drop-shadow-[0_0_10px_rgba(212,175,55,0.2)] mt-2"
              >
                Welcome to Kalvix <span className="text-gold-primary">Nexus</span>
              </motion.h2>
              <motion.p 
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
                className="text-text-muted text-sm mt-3"
              >
                Login to access your portal.
              </motion.p>
            </div>

            {/* Body */}
            <div className="p-6" style={{ transformStyle: 'preserve-3d' }}>
              <motion.form 
                onSubmit={handleLogin}
                initial={{ opacity: 0, translateZ: 40 }}
                animate={{ opacity: 1, translateZ: 20 }}
                transition={{ duration: 1, delay: 0.9, type: 'spring' }}
                className="space-y-4"
              >
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center gap-2 text-sm"
                    >
                      <AlertCircle size={16} />
                      <p>{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ x: -100, opacity: 0, rotateY: -20, translateZ: 40 }}
                  animate={{ x: 0, opacity: 1, rotateY: 0, translateZ: 20 }}
                  transition={{ duration: 1, delay: 0.9, type: 'spring' }}
                >
                  <label className="block text-sm font-medium text-text-secondary mb-1.5 ml-1">ID (Employee/Client)</label>
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full bg-bg-surface border border-gold-primary/30 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-all"
                    placeholder="Enter your ID"
                    required
                  />
                </motion.div>
                
                <motion.div
                  initial={{ x: 100, opacity: 0, rotateY: 20, translateZ: 40 }}
                  animate={{ x: 0, opacity: 1, rotateY: 0, translateZ: 20 }}
                  transition={{ duration: 1, delay: 1.1, type: 'spring' }}
                >
                  <label className="block text-sm font-medium text-text-secondary mb-1.5 ml-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-bg-surface border border-gold-primary/30 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-all"
                    placeholder="Enter your password"
                    required
                  />
                </motion.div>

                <motion.button
                  initial={{ y: 50, opacity: 0, translateZ: 40 }}
                  animate={{ y: 0, opacity: 1, translateZ: 20 }}
                  transition={{ duration: 1, delay: 1.3, type: 'spring' }}
                  whileHover={{ scale: 1.02, translateZ: 40 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gold-primary text-black font-bold rounded-xl mt-4 hover:bg-gold-light hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
                </motion.button>
              </motion.form>
            </div>

            {/* Footer Signups */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1.6, type: 'spring' }}
              className="p-7 pt-5 bg-bg-surface/50 border-t border-gold-primary/20 text-center flex flex-col gap-4 relative z-10"
            >
              <p className="text-sm text-text-muted">Don't have an account?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleNavigation('/client-signup')}
                  className="px-5 py-3 text-sm font-bold bg-gold-primary text-black rounded-xl hover:bg-gold-light hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all w-full"
                >
                  Sign Up as Client
                </button>
                <button
                  onClick={() => handleNavigation('/registration')}
                  className="px-5 py-3 text-sm font-bold border border-gold-primary/40 text-gold-primary rounded-xl hover:bg-gold-primary/10 hover:border-gold-primary hover:shadow-[0_0_10px_rgba(212,175,55,0.2)] transition-all w-full"
                >
                  Sign Up as Employee
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
