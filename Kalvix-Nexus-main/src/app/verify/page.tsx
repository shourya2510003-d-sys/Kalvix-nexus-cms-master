'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ref, get, child } from 'firebase/database';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Award, XCircle, Download, Loader2 } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id') || '';

  const [certId, setCertId] = useState(idParam);
  const [certSearching, setCertSearching] = useState(false);
  const [certResult, setCertResult] = useState<any>(null);
  const [certError, setCertError] = useState<string | null>(null);

  // Auto verify if ID is in the query parameter on load
  useEffect(() => {
    if (idParam.trim()) {
      verifyId(idParam.trim());
    }
  }, [idParam]);

  const verifyId = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setCertSearching(true);
    setCertError(null);
    setCertResult(null);

    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, `certificates/${idToVerify.trim()}`));
      if (snapshot.exists()) {
        setCertResult({ id: idToVerify.trim(), ...snapshot.val() });
      } else {
        setCertError('No credential found with this ID. Please double-check the characters or contact support.');
      }
    } catch (err) {
      console.error(err);
      setCertError('An error occurred during verification. Please try again.');
    } finally {
      setCertSearching(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyId(certId);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="font-rajdhani text-xs font-bold tracking-[0.4em] text-gold-primary uppercase">Security &amp; Registry</span>
        <h1 className="font-orbitron font-black text-3xl sm:text-5xl text-text-primary mt-2 mb-4 uppercase tracking-wider">
          Verify Credential
        </h1>
        <p className="text-text-muted text-xs sm:text-sm max-w-xl mx-auto leading-relaxed mb-10">
          Search the official Kalvix Nexus real-time registry to authenticate certificates of completion, appreciation, and achievement.
        </p>
      </motion.div>

      <form onSubmit={handleVerifySubmit} className="flex gap-2 p-1.5 border border-gold-primary/20 bg-bg-card rounded-2xl max-w-lg mx-auto focus-within:border-gold-primary/60 transition-all duration-300">
        <input
          type="text"
          placeholder="Enter Certificate ID (e.g. KNX-2026-000001)"
          value={certId}
          onChange={(e) => setCertId(e.target.value.toUpperCase())}
          className="bg-transparent border-0 outline-none text-text-primary placeholder-text-muted text-xs px-3 py-2.5 flex-1 font-mono uppercase focus:ring-0"
          required
        />
        <button
          type="submit"
          disabled={certSearching}
          className="bg-gold-primary text-black font-rajdhani font-bold text-xs tracking-wider uppercase px-5 py-2.5 rounded-xl hover:bg-gold-light active:scale-95 transition-all duration-200 flex items-center justify-center min-w-[90px] disabled:opacity-50"
        >
          {certSearching ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
        </button>
      </form>

      {/* Results */}
      <div className="mt-12 min-h-[200px]">
        {certSearching && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 size={32} className="animate-spin text-gold-primary" />
            <p className="text-xs text-text-muted font-rajdhani uppercase tracking-widest">Querying registry database...</p>
          </div>
        )}

        {!certSearching && certError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border border-rose-500/20 bg-rose-500/5 rounded-2xl max-w-lg mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <XCircle size={20} className="text-rose-400" />
              </div>
              <span className="font-orbitron font-bold text-rose-400 text-sm uppercase tracking-wider">Invalid Certificate</span>
            </div>
            <p className="text-rose-400/70 text-xs font-inter">{certError}</p>
          </motion.div>
        )}

        {!certSearching && certResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="border border-gold-primary/30 rounded-3xl bg-[#0A0A0A] overflow-hidden shadow-[0_20px_60px_rgba(212,175,55,0.15)] max-w-lg mx-auto text-left"
          >
            {/* Top bar */}
            <div className="bg-gradient-to-r from-[#0A0A0A] via-[#1a1505] to-[#0A0A0A] px-6 py-4 border-b border-gold-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="text-gold-primary" size={16} />
                <span className="font-orbitron font-bold text-[10px] tracking-widest text-gold-primary uppercase">Official Registry Record</span>
              </div>
              <span className="text-[9px] font-rajdhani font-black tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                VERIFIED
              </span>
            </div>

            <div className="p-6 space-y-5 text-white">
              {/* Certificate Title */}
              <div className="text-center pb-4 border-b border-white/10">
                <p className="text-[10px] font-rajdhani font-bold text-gold-primary uppercase tracking-widest mb-1">
                  Certificate of {certResult.certificate_type || 'Achievement'}
                </p>
                <p className="font-orbitron font-bold text-lg">{certResult.certificate_title || '—'}</p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                {[
                  { label: 'Employee Name', value: certResult.employee_name || certResult.name || '—' },
                  { label: 'Certificate ID',  value: certResult.certificate_id || certResult.id, mono: true },
                  { label: 'Designation',     value: certResult.designation || '—' },
                  { label: 'Issue Date',       value: certResult.issue_date
                      ? new Date(certResult.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                      : (certResult.date || '—') },
                  { label: 'Issued By',        value: certResult.issued_by || '—' },
                ].map(({ label, value, mono }) => (
                  <div key={label}>
                    <span className="block text-[8px] font-rajdhani font-black text-gray-500 uppercase tracking-widest mb-0.5">{label}</span>
                    <span className={`text-[11px] font-semibold text-white leading-tight ${mono ? 'font-mono' : ''}`}>{value}</span>
                  </div>
                ))}
              </div>

              {/* QR Code */}
              {certResult.qr_code && (
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[8px] font-rajdhani font-black text-gray-500 uppercase tracking-widest mb-1">Verification QR</p>
                    <p className="text-[10px] text-gray-400">Scan to re-verify</p>
                  </div>
                  <img src={certResult.qr_code} alt="Certificate QR" className="w-16 h-16 rounded-lg border border-gold-primary/20 bg-white p-0.5" />
                </div>
              )}

              {/* PDF Download */}
              {certResult.pdf_file && (
                <a
                  href={certResult.pdf_file}
                  download={`${certResult.certificate_id || certResult.id}.pdf`}
                  className="flex items-center justify-center gap-2 w-full border border-gold-primary/30 text-gold-primary hover:bg-gold-primary/10 py-2.5 rounded-xl text-xs font-rajdhani font-bold uppercase tracking-wider transition-colors"
                >
                  <Download size={14} /> Download Certificate PDF
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="bg-bg-primary text-text-primary min-h-screen relative overflow-hidden">
      <div className="absolute top-10 left-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-10 right-[-15%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-15" />
      
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-gold-primary" />
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
