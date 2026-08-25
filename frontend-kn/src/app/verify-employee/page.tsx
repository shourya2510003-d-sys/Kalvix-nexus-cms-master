'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ref, get, child } from 'firebase/database';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { XCircle, Loader2, UserCheck, ShieldCheck } from 'lucide-react';
import EmployeeIdCard from '@/components/EmployeeIdCard';

function VerifyEmployeeContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id') || '';

  const [searchId, setSearchId] = useState(idParam);
  
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (idParam.trim()) {
      setSearchId(idParam.trim());
      verifyId(idParam.trim());
    }
  }, [idParam]);

  const verifyId = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const dbRef = ref(db);
      
      const snapshot = await get(child(dbRef, `employees`));
      if (snapshot.exists()) {
        const employees = snapshot.val();
        const emp = Object.values(employees).find((e: any) => e.employee_id === idToVerify.trim().toUpperCase());
        if (emp) {
          setResult(emp);
        } else {
          setError('No employee found with this ID. Please double-check the ID.');
        }
      } else {
        setError('No employee registry found.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyId(searchId);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="font-rajdhani text-xs font-bold tracking-[0.4em] text-gold-primary uppercase flex items-center justify-center gap-2">
          <ShieldCheck size={16} /> Security & Registry
        </span>
        <h1 className="font-orbitron font-black text-3xl sm:text-5xl text-text-primary mt-2 mb-4 uppercase tracking-wider">
          Employee Verification
        </h1>
        <p className="text-text-muted text-xs sm:text-sm max-w-xl mx-auto leading-relaxed mb-8">
          Search the official Kalvix Nexus real-time registry to authenticate employee identity.
        </p>
      </motion.div>

      <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row gap-2 p-1.5 border border-gold-primary/20 bg-bg-card rounded-2xl max-w-lg mx-auto focus-within:border-gold-primary/60 transition-all duration-300">
        <input
          type="text"
          placeholder="Enter Employee ID (e.g. KN-EMP-01)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value.toUpperCase())}
          className="bg-transparent border-0 outline-none text-text-primary placeholder-text-muted text-xs px-3 py-2.5 flex-1 font-mono uppercase focus:ring-0 text-center sm:text-left w-full"
          required
        />
        <button
          type="submit"
          disabled={isSearching}
          className="bg-gold-primary text-black font-rajdhani font-bold text-xs tracking-wider uppercase px-6 py-2.5 rounded-xl hover:bg-gold-light active:scale-95 transition-all duration-200 flex items-center justify-center min-w-[120px] disabled:opacity-50"
        >
          {isSearching ? <Loader2 size={14} className="animate-spin" /> : 'Verify Now'}
        </button>
      </form>

      {/* Results Section */}
      <div className="mt-12 min-h-[300px]">
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 size={32} className="animate-spin text-gold-primary" />
            <p className="text-xs text-text-muted font-rajdhani uppercase tracking-widest">Querying registry database...</p>
          </div>
        )}

        {!isSearching && error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border border-rose-500/20 bg-rose-500/5 rounded-2xl max-w-lg mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <XCircle size={20} className="text-rose-400" />
              </div>
              <span className="font-orbitron font-bold text-rose-400 text-sm uppercase tracking-wider">Verification Failed</span>
            </div>
            <p className="text-rose-400/70 text-xs font-inter">{error}</p>
          </motion.div>
        )}

        {!isSearching && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className="flex items-center gap-2 mb-6 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <UserCheck size={14} className="text-emerald-400" />
              </div>
              <span className="font-orbitron font-bold text-emerald-400 text-sm tracking-widest uppercase">
                Successfully Verified
              </span>
            </div>
            <EmployeeIdCard employee={result} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmployeePage() {
  return (
    <div className="bg-bg-primary text-text-primary min-h-screen relative overflow-hidden">
      <div className="absolute top-10 left-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-10 right-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-15" />
      
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-gold-primary" />
        </div>
      }>
        <VerifyEmployeeContent />
      </Suspense>
    </div>
  );
}
