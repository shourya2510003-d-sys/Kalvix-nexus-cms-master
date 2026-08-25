'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, onValue, get, push, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { LogOut, LayoutDashboard, Briefcase, CreditCard, Clock, FileText, CheckCircle, Star, Download, Send, ChevronLeft, ChevronRight, Menu, X, Sun, Moon, RefreshCw, Activity, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';

const TIMELINE_STEPS = [
  'Requirement Approved',
  'Planning',
  'Design',
  'Development',
  'Testing',
  'Deployment',
  'Completed'
];

const formatINR = (val: any) => {
  if (!val) return '₹0';
  const num = parseInt(val.toString().replace(/\D/g, ''), 10);
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

export default function ClientDashboard() {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem('clientAuth');
    router.push('/');
  };

  const sessionTimeLeft = useInactivityTimeout(handleLogout);
  const [activeTab, setActiveTab] = useState('overview');
  const [clientData, setClientData] = useState<any>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [myRequirements, setMyRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Requirement form state
  const [reqProjectName, setReqProjectName] = useState('');
  const [reqCategory, setReqCategory] = useState('Web');
  const [reqDeadline, setReqDeadline] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqLoading, setReqLoading] = useState(false);

  const handleRequirementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientData) return;
    setReqLoading(true);
    try {
      await push(ref(db, 'client_requirements'), {
        clientId: clientData.clientId,
        companyName: clientData.companyName,
        projectName: reqProjectName,
        category: reqCategory,
        deadline: reqDeadline,
        description: reqDescription,
        status: 'Pending',
        timestamp: new Date().toISOString()
      });
      alert('Requirement submitted successfully!');
      setReqProjectName('');
      setReqCategory('Web');
      setReqDeadline('');
      setReqDescription('');
    } catch (error) {
      console.error(error);
      alert('Error submitting requirement.');
    } finally {
      setReqLoading(false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const formatSessionTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const auth = localStorage.getItem('clientAuth');
    if (!auth) {
      router.push('/');
      return;
    }
    const { clientId } = JSON.parse(auth);
    
    // Load Client Data
    get(ref(db, `clients/${clientId}`)).then(snap => {
      if(snap.exists()) setClientData(snap.val());
    });

    // Load Projects
    const projectsRef = ref(db, 'client_projects');
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allProjects = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        const myProjects = allProjects.filter(p => p.clientId === clientId);
        setProjects(myProjects);
      } else {
        setProjects([]);
      }
      setLoading(false);
    });

    // Load Requirements
    const reqRef = ref(db, 'client_requirements');
    const unsubscribeReq = onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allReqs = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        const mine = allReqs.filter(r => r.clientId === clientId).reverse();
        setMyRequirements(mine);
      } else {
        setMyRequirements([]);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeReq();
    };
  }, [router]);

  const currentProject = projects[0] || null;

  const handleSubmitReview = async () => {
    if (!selectedRating || !reviewText.trim() || !currentProject) return;
    setIsSubmittingReview(true);
    try {
      const reviewData = {
        name: currentProject.ownerName || clientData?.ownerName || 'Client',
        role: 'Client',
        company: currentProject.companyName || clientData?.companyName || '',
        text: reviewText,
        rating: selectedRating.toString(),
        approved: false,
        submittedAt: new Date().toISOString()
      };
      
      await push(ref(db, 'reviews'), reviewData);
      await update(ref(db, `client_projects/${currentProject.id}`), { reviewSubmitted: true });
      
      setSelectedRating(0);
      setReviewText('');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex justify-center items-center text-gold-primary">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-bg-primary min-h-screen flex flex-col md:flex-row overflow-hidden">
        
      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gold-primary/10 bg-bg-card z-30 relative">
        <h2 className="font-orbitron font-bold text-lg text-gold-primary uppercase tracking-wider">
          Client Portal
        </h2>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gold-primary p-2 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`w-full md:w-64 bg-bg-card border-r border-gold-primary/10 flex flex-col z-20 flex-shrink-0 absolute md:relative transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0 h-[calc(100vh-73px)]' : '-translate-x-full md:translate-x-0 h-screen'}`}>
        <div className="p-6 border-b border-gold-primary/10">
          <h2 className="font-orbitron font-bold text-lg text-gold-primary uppercase tracking-wider">
            Client Portal
          </h2>
          <p className="text-xs text-text-muted font-mono mt-1">{clientData?.clientId}</p>
        </div>
        
        <nav className="flex-1 py-4 px-4 flex flex-col gap-2">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'timeline', label: 'Project Timeline', icon: Clock },
            { id: 'payments', label: 'Payment Records', icon: CreditCard },
            { id: 'requirements', label: 'Submit Requirements', icon: FileText },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary shadow-[0_0_8px_rgba(212,175,55,0.4)] font-bold' 
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-surface border border-transparent'
              }`}
            >
              <item.icon size={18} />
              <span className="font-rajdhani font-semibold tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gold-primary/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-rajdhani font-semibold tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-gold-primary/10 bg-bg-card/50 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 flex-shrink-0 relative">
          <div className="flex-1 flex items-center justify-start gap-4">
            <Link href="/" className="hover:scale-105 transition-transform" title="Go to Public Site">
              <Image src="/logo.png" alt="Kalvix Nexus" width={32} height={32} className="object-contain" />
            </Link>
            <h1 className="hidden md:block font-orbitron font-bold text-lg text-gold-primary tracking-[0.2em] uppercase">
              <span className="w-2 h-2 rounded-full bg-gold-primary inline-block mr-3 animate-pulse"></span>
              Client Portal
            </h1>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center flex-shrink-0 scale-90 md:scale-100 transform origin-center">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="flex items-center gap-2 text-gold-primary bg-gold-primary/10 px-4 py-1.5 rounded-full border border-gold-primary/20 shadow-sm">
                <Clock size={14} className="opacity-70" />
                <span className="text-xs font-rajdhani font-bold tracking-widest uppercase">
                  Session: <span className="font-mono text-text-primary ml-1">{formatSessionTime(sessionTimeLeft)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-end gap-2 md:gap-4 flex-shrink-0 ml-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full border border-gold-primary/20 text-gold-primary hover:bg-gold-primary/10 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <button 
              onClick={() => {
                setIsRefreshing(true);
                get(ref(db, 'client_projects')).then((snapshot) => {
                  const data = snapshot.val();
                  if (data) {
                    const allProjects = Object.keys(data).map(k => ({ id: k, ...data[k] }));
                    const myProjects = allProjects.filter(p => p.clientId === clientData?.clientId);
                    setProjects(myProjects);
                  }
                  setTimeout(() => setIsRefreshing(false), 500);
                });
              }}
              disabled={isRefreshing}
              className="flex items-center gap-2 text-xs font-mono text-gold-primary hover:text-gold-light bg-gold-primary/10 hover:bg-gold-primary/20 px-3 py-1.5 rounded-full border border-gold-primary/20 transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> 
              <span className="hidden md:inline">Refresh Data</span>
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
              <Activity size={12} className="animate-pulse" /> Live DB
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-4 md:p-8 z-10 w-full">
          <div className="max-w-5xl mx-auto space-y-8">
          
          <header className="mb-8 border-b border-gold-primary/10 pb-4">
            <h1 className="text-2xl md:text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-primary to-yellow-200 uppercase tracking-wider">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'timeline' && 'Project Timeline'}
              {activeTab === 'payments' && 'Payment Records'}
              {activeTab === 'requirements' && 'Project Requirements'}
            </h1>
            <p className="text-text-muted text-sm mt-1">Welcome back, {clientData?.companyName}</p>
          </header>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Banner Image */}
              <img src="/banner.png" alt="Kalvix Nexus Banner" className="w-full h-auto max-h-[300px] object-cover rounded-xl border border-gold-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)] mb-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-bg-card border border-gold-primary/20 p-6 rounded-xl text-center">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2">Client ID</p>
                  <p className="font-orbitron font-bold text-lg text-gold-primary">{clientData?.clientId}</p>
                </div>
                <div className="bg-bg-card border border-gold-primary/20 p-6 rounded-xl text-center">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2">Company Name</p>
                  <p className="font-orbitron font-bold text-lg text-text-primary">{clientData?.companyName}</p>
                </div>
                <div className="bg-bg-card border border-gold-primary/20 p-6 rounded-xl text-center">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2">Project Manager</p>
                  <p className="font-orbitron font-bold text-lg text-emerald-400">{currentProject?.assignedManager || 'Pending'}</p>
                </div>
                <div className="bg-bg-card border border-gold-primary/20 p-6 rounded-xl text-center">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2">Project Status</p>
                  <p className="font-orbitron font-bold text-sm text-text-primary">{currentProject?.status || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && currentProject && (
            <div className="space-y-8 animate-fade-in">
              {currentProject.status === 'Completed' ? (
                <div className="bg-bg-card border border-emerald-500/30 p-8 rounded-2xl text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-emerald-500" />
                  </div>
                  <h2 className="font-orbitron font-bold text-3xl text-emerald-400 mb-2 uppercase tracking-widest">Congratulations!</h2>
                  <p className="text-text-primary mb-12 text-lg">Your project has been successfully delivered.<br/><span className="text-text-muted text-sm">Thank you for choosing Kalvix Nexus.</span></p>                  <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
                    <button className="flex items-center justify-center gap-2 bg-emerald-500 text-bg-primary px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-emerald-400 transition-colors">
                      <Download size={18} /> Download Project
                    </button>
                    <button className="flex items-center justify-center gap-2 border border-gold-primary/30 text-gold-primary px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-gold-primary/10 transition-colors">
                      <Download size={18} /> Download Invoice
                    </button>
                  </div>
                  
                  {currentProject.reviewSubmitted ? (
                    <div className="bg-bg-surface border border-gold-primary/20 p-6 rounded-xl max-w-lg mx-auto">
                      <h4 className="font-orbitron font-bold text-gold-primary mb-2 uppercase tracking-widest">Feedback Received</h4>
                      <p className="text-text-muted text-sm">Thank you for your valuable feedback! It has been submitted for review.</p>
                    </div>
                  ) : (
                    <div className="bg-bg-surface border border-gold-primary/20 p-6 rounded-xl max-w-lg mx-auto">
                      <h3 className="font-rajdhani font-bold text-xl text-gold-primary mb-2">Provide Feedback</h3>
                      <p className="text-sm text-text-muted mb-6">Your feedback helps us improve our services.</p>
                      
                      {/* Star Rating */}
                      <div className="flex gap-2 justify-center mb-6">
                        {[1,2,3,4,5].map(star => (
                          <Star 
                            key={star} 
                            onClick={() => setSelectedRating(star)}
                            className={`hover:scale-110 cursor-pointer transition-transform ${star <= selectedRating ? 'text-gold-primary fill-gold-primary' : 'text-text-muted'}`} 
                            size={32} 
                          />
                        ))}
                      </div>
                      
                      {selectedRating > 0 && (
                        <div className="animate-fade-in space-y-4 text-left">
                          <textarea 
                            rows={3} 
                            placeholder="Tell us what you loved about working with Kalvix Nexus..." 
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="w-full bg-bg-primary border border-gold-primary/20 rounded-lg px-4 py-3 text-sm focus:border-gold-primary outline-none resize-none"
                          />
                          <button 
                            onClick={handleSubmitReview}
                            disabled={!reviewText.trim() || isSubmittingReview}
                            className="w-full bg-gold-primary text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
                          >
                            {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-bg-card border border-gold-primary/20 p-8 rounded-xl">
                  <h3 className="font-orbitron font-bold text-xl text-gold-primary mb-8">{currentProject.projectTitle} - Progress</h3>
                  
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
                    
                    <div className="space-y-8">
                      {TIMELINE_STEPS.map((step, index) => {
                        const currentIndex = TIMELINE_STEPS.indexOf(currentProject.status || 'Requirement Approved');
                        const isCompleted = index < currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                          <div key={step} className="flex items-start gap-4 relative z-10">
                            <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors ${
                              isCompleted ? 'bg-emerald-500 border-emerald-500 text-bg-primary shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 
                              isCurrent ? 'bg-bg-card border-gold-primary text-gold-primary animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 
                              'bg-bg-surface border-border text-text-muted'
                            }`}>
                              {isCompleted ? <CheckCircle size={20} /> : <span className="font-bold">{index + 1}</span>}
                            </div>
                            <div className={`pt-3 ${isCurrent ? 'text-gold-primary' : isCompleted ? 'text-emerald-400' : 'text-text-muted'}`}>
                              <h4 className="font-orbitron font-bold tracking-wider uppercase text-lg">{step}</h4>
                              <p className="text-sm font-rajdhani mt-1">
                                {isCompleted ? 'Completed successfully.' : isCurrent ? 'Currently in progress...' : 'Pending.'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fade-in">
              {(() => {
                const totalAmount = parseInt((currentProject?.estimatedBudget || '0').toString().replace(/\D/g, ''), 10) || 0;
                const payments = currentProject?.payments ? Object.values(currentProject.payments) as any[] : [];
                const paidAmount = payments.reduce((sum, p) => sum + (parseInt(p.amount.toString().replace(/\D/g, ''), 10) || 0), 0);
                const dueAmount = Math.max(0, totalAmount - paidAmount);

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-bg-card border border-gold-primary/20 p-6 rounded-xl">
                        <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="font-orbitron font-bold text-2xl text-text-primary">{formatINR(totalAmount)}</p>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl">
                        <p className="text-[10px] text-emerald-400 uppercase tracking-widest mb-1">Paid Amount</p>
                        <p className="font-orbitron font-bold text-2xl text-emerald-400">{formatINR(paidAmount)}</p>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl">
                        <p className="text-[10px] text-red-400 uppercase tracking-widest mb-1">Due Amount</p>
                        <p className="font-orbitron font-bold text-2xl text-red-400">{formatINR(dueAmount)}</p>
                      </div>
                    </div>

                    <div className="bg-bg-card border border-gold-primary/10 rounded-xl overflow-hidden">
                      {payments.length === 0 ? (
                        <div className="text-center text-text-muted font-rajdhani py-12">
                          No payment history available yet.
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-bg-surface border-b border-gold-primary/10">
                              <th className="py-4 px-6 text-xs font-rajdhani uppercase tracking-widest text-text-muted">Date</th>
                              <th className="py-4 px-6 text-xs font-rajdhani uppercase tracking-widest text-text-muted">Mode</th>
                              <th className="py-4 px-6 text-xs font-rajdhani uppercase tracking-widest text-text-muted">Remark</th>
                              <th className="py-4 px-6 text-xs font-rajdhani uppercase tracking-widest text-text-muted text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments.map((p, i) => (
                              <tr key={i} className="border-b border-gold-primary/5 hover:bg-white/5 transition-colors">
                                <td className="py-4 px-6 text-sm text-text-primary">{p.date}</td>
                                <td className="py-4 px-6 text-sm text-text-primary">{p.mode}</td>
                                <td className="py-4 px-6 text-sm text-text-muted">{p.remark || '-'}</td>
                                <td className="py-4 px-6 text-sm font-orbitron font-bold text-emerald-400 text-right">{formatINR(p.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* REQUIREMENTS TAB */}
          {activeTab === 'requirements' && (
            <>
              <div className="bg-bg-card border border-gold-primary/20 p-8 rounded-xl animate-fade-in">
                <h2 className="font-orbitron font-bold text-xl text-gold-primary mb-6">Submit New Requirements</h2>
                <form className="space-y-6" onSubmit={handleRequirementSubmit}>
                  <div>
                    <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Project Name</label>
                    <input required type="text" value={reqProjectName} onChange={e => setReqProjectName(e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Category</label>
                      <select required value={reqCategory} onChange={e => setReqCategory(e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors">
                        <option value="Web">Web Development</option>
                        <option value="App">App Development</option>
                        <option value="Design">UI/UX Design</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Deadline</label>
                      <input required type="date" value={reqDeadline} onChange={e => setReqDeadline(e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Description & Features</label>
                    <textarea required rows={5} value={reqDescription} onChange={e => setReqDescription(e.target.value)} className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg px-4 py-3 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors resize-none"></textarea>
                  </div>
                  <button type="submit" disabled={reqLoading} className="flex items-center justify-center gap-2 bg-gold-primary text-black font-rajdhani font-bold tracking-widest uppercase px-8 py-3 rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50">
                    {reqLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} 
                    {reqLoading ? 'Submitting...' : 'Submit Requirement'}
                  </button>
                </form>
              </div>

              {myRequirements.length > 0 && (
                <div className="mt-8 bg-bg-card border border-gold-primary/20 p-8 rounded-xl animate-fade-in">
                  <h2 className="font-orbitron font-bold text-xl text-gold-primary mb-6">Your Submitted Requirements</h2>
                  <div className="space-y-4">
                    {myRequirements.map((req) => (
                      <div key={req.id} className="flex flex-col gap-2">
                        <div className="bg-bg-surface border border-gold-primary/10 rounded-lg p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div>
                            <h3 className="font-rajdhani font-bold text-lg text-text-primary">{req.projectName}</h3>
                            <p className="text-xs text-text-muted mt-1">Category: {req.category} • Deadline: {req.deadline}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                              req.status === 'Pending' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                              req.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        </div>
                        {req.status === 'Rejected' && req.rejectionReason && (
                          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                            <h4 className="text-xs font-rajdhani font-bold text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                              <X size={12} /> Reason for Rejection
                            </h4>
                            <p className="text-sm text-text-muted whitespace-pre-wrap">{req.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          </div>
        </div>
      </div>
    </div>
  );
}
