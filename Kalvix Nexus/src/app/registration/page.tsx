'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { ref, push } from 'firebase/database';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function RegistrationPage() {
  const [form, setForm] = useState({
    name: '',
    address: '',
    age: '',
    mobile: '',
    email: '',
    designation: '',
    department: '',
    project: '',
    joining_date: '',
    profile_photo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Timer for Resend OTP
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpModal && resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, resendTimer]);

  const set_ = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      set_('profile_photo', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.profile_photo) {
      alert('Please upload a profile photo. It is compulsory.');
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(form.mobile)) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name: form.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setResendTimer(60);
      setShowOtpModal(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name: form.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
      
      setResendTimer(60);
      alert('A new OTP has been sent to your email.');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to resend OTP.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setIsVerifying(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      // Upload photo to Cloudinary
      const { uploadToCloudinary } = await import('@/lib/cloudinary');
      const photoUrl = await uploadToCloudinary(form.profile_photo);
      
      if (!photoUrl) {
        throw new Error('Failed to upload photo to server. Please try again.');
      }
      
      // OTP Valid - Push to Firebase
      const pendingRef = ref(db, 'pending_employees');
      await push(pendingRef, {
        ...form,
        profile_photo: photoUrl,
        submitted_at: new Date().toISOString(),
      });
      
      setShowOtpModal(false);
      setStatus('success');
      setForm({
        name: '', address: '', age: '', mobile: '', email: '',
        designation: '', department: '', project: '', joining_date: '', profile_photo: '',
      });
      setOtp('');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const fields: { key: keyof typeof form; label: string; type?: string; required?: boolean; pattern?: string; maxLength?: number; }[] = [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'address', label: 'Address', required: true },
    { key: 'age', label: 'Age', type: 'number', required: true },
    { key: 'mobile', label: 'Mobile Number', required: true, pattern: '[0-9]{10}', maxLength: 10 },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'department', label: 'Department', required: true },
    { key: 'joining_date', label: 'Preferred Joining Date', type: 'date', required: true },
  ];

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-6 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-card border border-gold-primary/20 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_40px_rgba(212,175,55,0.1)]"
        >
          <CheckCircle2 size={64} className="text-gold-primary mx-auto mb-4" />
          <h2 className="font-orbitron text-2xl font-bold mb-2">Registration Submitted!</h2>
          <p className="text-text-muted text-sm mb-6">
            Your application has been received and is pending admin approval. We will contact you shortly.
          </p>
          <Link
            href="/"
            className="inline-block bg-gold-primary text-black font-rajdhani font-bold px-6 py-3 rounded-lg hover:bg-gold-light transition-colors"
          >
            Return to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-24 relative overflow-hidden pt-28">
      {/* Decorative Orbs */}
      <div className="absolute top-20 left-[-10%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-20 right-[-10%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-15" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <span className="font-rajdhani text-xs font-bold tracking-[0.4em] text-gold-primary uppercase">Join Kalvix</span>
          <h1 className="font-orbitron font-black text-3xl sm:text-4xl text-text-primary mt-2 mb-4 uppercase tracking-wider">
            Employee Registration
          </h1>
          <p className="text-text-muted text-sm max-w-xl mx-auto">
            Fill out the form below to apply. Your application will be reviewed by our administration team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
          {/* Photo Upload */}
          <div className="bg-bg-card border border-gold-primary/15 rounded-2xl p-6 shadow-xl">
            <h3 className="font-rajdhani font-bold text-sm text-gold-primary uppercase tracking-widest mb-4">Profile Photo <span className="text-rose-500">*</span></h3>
            <div className="flex items-center gap-6">
              {form.profile_photo ? (
                <img src={form.profile_photo} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gold-primary/40" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gold-primary/5 border-2 border-gold-primary/20 border-dashed flex items-center justify-center text-gold-primary">
                  <Camera size={28} />
                </div>
              )}
              <div>
                <label className="cursor-pointer bg-gold-primary/10 hover:bg-gold-primary/20 border border-gold-primary/30 text-gold-primary px-5 py-2.5 rounded-lg text-sm font-rajdhani font-bold flex items-center gap-2 transition-colors">
                  <Camera size={16} /> Upload Photo
                  <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </label>
                <p className="text-xs text-text-muted mt-2">JPG, PNG, WEBP — max 2MB</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-bg-card border border-gold-primary/15 rounded-2xl p-6 shadow-xl">
            <h3 className="font-rajdhani font-bold text-sm text-gold-primary uppercase tracking-widest mb-6">Personal & Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fields.map(({ key, label, type = 'text', required }) => (
                <div key={key}>
                  <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-widest mb-1.5 block">
                    {label}{required && <span className="text-gold-primary"> *</span>}
                  </label>
                  <input
                    type={type}
                    value={form[key] as string}
                    onChange={(e) => set_(key, e.target.value)}
                    required={required}
                    {...(key === 'mobile' ? { pattern: '[0-9]{10}', maxLength: 10, title: 'Please enter a valid 10-digit mobile number' } : {})}
                    className="w-full bg-bg-surface border border-gold-primary/10 rounded-lg py-3 px-4 text-sm text-text-primary focus:border-gold-primary/50 focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gold-primary hover:bg-gold-light text-black py-4 rounded-xl text-lg font-rajdhani font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            {isSubmitting ? (
              <><Loader2 size={20} className="animate-spin" /> Submitting Application...</>
            ) : (
              <><Send size={20} /> Submit Registration</>
            )}
          </button>
        </form>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bg-card border border-gold-primary/30 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-[0_0_30px_rgba(212,175,55,0.15)]"
          >
            <h3 className="font-orbitron font-bold text-xl text-text-primary mb-2">Verify Your Email</h3>
            <p className="text-sm text-text-muted mb-6">
              We've sent a 6-digit code to <br/><span className="text-gold-primary font-bold">{form.email}</span>
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="0 0 0 0 0 0"
                className="w-full bg-bg-surface border border-gold-primary/30 rounded-xl py-4 text-center text-2xl font-bold tracking-[0.5em] text-text-primary focus:border-gold-primary focus:outline-none transition-colors"
                required
              />
              <button
                type="submit"
                disabled={isVerifying || otp.length !== 6}
                className="w-full bg-gold-primary hover:bg-gold-light text-black py-3 rounded-xl font-rajdhani font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isVerifying ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {isVerifying ? 'Verifying...' : 'Confirm & Register'}
              </button>
              
              <div className="flex flex-col items-center justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                  className={`text-xs font-rajdhani font-bold uppercase tracking-wider transition-colors ${resendTimer > 0 ? 'text-text-muted cursor-not-allowed' : 'text-gold-primary hover:text-gold-light'}`}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="text-xs text-text-muted hover:text-white transition-colors"
                >
                  Cancel / Edit Email
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
