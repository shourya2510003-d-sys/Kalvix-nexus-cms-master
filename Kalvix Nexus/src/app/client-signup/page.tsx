'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, ArrowLeft, Building2, Phone, MapPin, Briefcase, Lock } from 'lucide-react';
import { ref, push } from 'firebase/database';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: '', ownerName: '', contactPerson: '', gstNumber: '',
    mobile: '', whatsapp: '', email: '',
    address: '', city: '', state: '', country: '', pincode: '',
    projectTitle: '', projectCategory: '', projectDescription: '', estimatedBudget: '', expectedCompletion: '',
    password: '', confirmPassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    
    if (form.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      setErrorMsg("Password must contain at least 1 special character.");
      return;
    }
    
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(form.mobile)) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    
    if (!mobileRegex.test(form.whatsapp)) {
      setErrorMsg("Please enter a valid 10-digit WhatsApp number.");
      return;
    }
    
    setIsSubmitting(true);
    setStatus('idle');
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, name: form.contactPerson || form.companyName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setResendTimer(60);
      setShowOtpModal(true);
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      setErrorMsg(error.message || 'Failed to send OTP. Please try again.');
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
        body: JSON.stringify({ email: form.email, name: form.contactPerson || form.companyName }),
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
      
      // OTP Valid - Push to Firebase
      const requestsRef = ref(db, 'client_requests');
      const { confirmPassword, ...dataToSave } = form;
      
      await push(requestsRef, {
        ...dataToSave,
        status: 'Pending Approval',
        submitted_at: new Date().toISOString(),
      });
      
      setShowOtpModal(false);
      setStatus('success');
      setOtp('');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      alert(error.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-card border border-gold-primary/20 p-8 md:p-12 rounded-2xl max-w-md w-full text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="font-orbitron font-bold text-2xl text-text-primary mb-4">Registration Successful!</h2>
          <p className="text-text-muted text-sm mb-8">
            Your client registration request has been submitted and is currently <strong className="text-gold-primary font-normal">Pending Approval</strong>. 
            Once approved, you will receive your Client ID and Password via WhatsApp.
          </p>
          <Link href="/" className="inline-block bg-gold-primary text-black px-8 py-3 rounded-xl font-rajdhani font-bold tracking-widest uppercase hover:bg-gold-light transition-all">
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gold-glow rounded-full blur-[150px] pointer-events-none opacity-10" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-gold-primary transition-colors mb-8 text-sm font-rajdhani font-bold tracking-widest uppercase">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="mb-10">
          <h1 className="font-orbitron font-black text-3xl md:text-4xl text-text-primary uppercase tracking-wide mb-4">
            Client <span className="text-gold-primary">Registration</span>
          </h1>
          <p className="text-text-muted text-sm max-w-2xl">
            Partner with Kalvix Nexus. Fill out the details below to submit your project requirements and register as a client.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Company Details */}
          <div className="bg-bg-card border border-gold-primary/20 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gold-primary/10">
              <Building2 className="text-gold-primary" size={20} />
              <h2 className="font-orbitron font-bold text-lg text-text-primary uppercase tracking-wider">Company Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Company Name *</label>
                <input required type="text" value={form.companyName} onChange={(e) => set_('companyName', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Owner Name *</label>
                <input required type="text" value={form.ownerName} onChange={(e) => set_('ownerName', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Contact Person *</label>
                <input required type="text" value={form.contactPerson} onChange={(e) => set_('contactPerson', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">GST Number (Optional)</label>
                <input type="text" value={form.gstNumber} onChange={(e) => set_('gstNumber', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-bg-card border border-gold-primary/20 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gold-primary/10">
              <Phone className="text-gold-primary" size={20} />
              <h2 className="font-orbitron font-bold text-lg text-text-primary uppercase tracking-wider">Contact Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Mobile Number *</label>
                <input required type="tel" pattern="[0-9]{10}" maxLength={10} title="Please enter a valid 10-digit mobile number" value={form.mobile} onChange={(e) => set_('mobile', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">WhatsApp Number *</label>
                <input required type="tel" pattern="[0-9]{10}" maxLength={10} title="Please enter a valid 10-digit WhatsApp number" value={form.whatsapp} onChange={(e) => set_('whatsapp', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Email Address *</label>
                <input required type="email" value={form.email} onChange={(e) => set_('email', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
            </div>
          </div>

          {/* Business Address */}
          <div className="bg-bg-card border border-gold-primary/20 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gold-primary/10">
              <MapPin className="text-gold-primary" size={20} />
              <h2 className="font-orbitron font-bold text-lg text-text-primary uppercase tracking-wider">Business Address</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Full Address *</label>
                <input required type="text" value={form.address} onChange={(e) => set_('address', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">City *</label>
                <input required type="text" value={form.city} onChange={(e) => set_('city', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">State *</label>
                <input required type="text" value={form.state} onChange={(e) => set_('state', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Country *</label>
                <input required type="text" value={form.country} onChange={(e) => set_('country', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Pincode *</label>
                <input required type="text" value={form.pincode} onChange={(e) => set_('pincode', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-bg-card border border-gold-primary/20 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gold-primary/10">
              <Briefcase className="text-gold-primary" size={20} />
              <h2 className="font-orbitron font-bold text-lg text-text-primary uppercase tracking-wider">Project Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Project Title *</label>
                <input required type="text" value={form.projectTitle} onChange={(e) => set_('projectTitle', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Project Category *</label>
                <select required value={form.projectCategory} onChange={(e) => set_('projectCategory', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors">
                  <option value="">Select Category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="App Development">App Development</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Custom Software">Custom Software</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Project Description *</label>
                <textarea required rows={4} placeholder="All Needs & Requirement" value={form.projectDescription} onChange={(e) => set_('projectDescription', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors resize-none"></textarea>
              </div>
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Estimated Budget *</label>
                <input required type="text" placeholder="e.g. ₹50,000" value={form.estimatedBudget} onChange={(e) => set_('estimatedBudget', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Expected Completion Date *</label>
                <input required type="date" value={form.expectedCompletion} onChange={(e) => set_('expectedCompletion', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-bg-card border border-gold-primary/20 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gold-primary/10">
              <Lock className="text-gold-primary" size={20} />
              <h2 className="font-orbitron font-bold text-lg text-text-primary uppercase tracking-wider">Account Setup</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Password *</label>
                <input required type="password" value={form.password} onChange={(e) => set_('password', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Confirm Password *</label>
                <input required type="password" value={form.confirmPassword} onChange={(e) => set_('confirmPassword', e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
              {errorMsg}
            </div>
          )}

          <div className="text-center">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-gold-primary text-black font-rajdhani font-bold text-sm tracking-widest uppercase px-12 py-4 rounded-xl hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_15px_rgba(212,175,55,0.3)] disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Submit Registration'}
            </button>
          </div>
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
