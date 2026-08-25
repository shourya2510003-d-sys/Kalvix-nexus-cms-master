'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, Settings, LogOut, Briefcase, FileText, ImageIcon, MessageSquare, Activity, Edit3, Save, Plus, Trash2, CheckCircle, UserCheck, Shield, Award, RefreshCw, Sun, Moon, Clock, UserPlus, FileCheck, Send, ChevronLeft, ChevronRight, Menu, X, CreditCard, Star, IndianRupee, GripVertical
} from 'lucide-react';
import { ref, get, set, update, push, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import dynamic from 'next/dynamic';

const EmployeeModule = dynamic(() => import('@/components/admin/EmployeeModule'), { ssr: false });
const PendingRegistrationsModule = dynamic(() => import('@/components/admin/PendingRegistrationsModule'), { ssr: false });
const AttendanceModule = dynamic(() => import('@/components/admin/AttendanceModule'), { ssr: false });
const AssignProjectModule = dynamic(() => import('@/components/admin/AssignProjectModule'), { ssr: false });
const ApproveProjectsModule = dynamic(() => import('@/components/admin/ApproveProjectsModule'), { ssr: false });
const IdCardsModule = dynamic(() => import('@/components/admin/IdCardsModule'), { ssr: false });
const ClientRequests = dynamic(() => import('@/components/admin/ClientRequests'), { ssr: false });
const ClientsList = dynamic(() => import('@/components/admin/ClientsList'), { ssr: false });
const ClientProjects = dynamic(() => import('@/components/admin/ClientProjects'), { ssr: false });
const ThemeCMSModule = dynamic(() => import('@/components/admin/ThemeCMSModule'), { ssr: false });

import PaymentHistory from '@/components/admin/PaymentHistory';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTabState] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tabHistory, setTabHistory] = useState<string[]>(['overview']);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const setActiveTab = (newTab: string) => {
    if (newTab === activeTab) return;
    const newHistory = tabHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(newTab);
    setTabHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    setActiveTabState(newTab);
    setEditingIndex(null);
    setIsMobileMenuOpen(false); // Close mobile menu on tab change
  };

  const handleBack = () => {
    if (editingIndex !== null) {
      setEditingIndex(null);
      return;
    }
    if (currentHistoryIndex > 0) {
      const prevIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(prevIndex);
      setActiveTabState(tabHistory[prevIndex]);
      setEditingIndex(null);
    }
  };

  const handleForward = () => {
    if (currentHistoryIndex < tabHistory.length - 1) {
      const nextIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(nextIndex);
      setActiveTabState(tabHistory[nextIndex]);
      setEditingIndex(null);
    }
  };

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // For visual feedback
    const el = e.currentTarget as HTMLElement;
    setTimeout(() => { el.style.opacity = '0.5'; }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number, activeTabStr: string, currentList: any[], updateStateList: Function) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const newList = [...currentList];
    const draggedItem = newList[draggedIndex];
    
    newList.splice(draggedIndex, 1);
    newList.splice(dropIndex, 0, draggedItem);
    
    updateStateList(newList);
    saveList(activeTabStr, newList);
    setDraggedIndex(null);
  };
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setEditingIndex(null);
  }, [activeTab]);

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light';
    setTheme(t);
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
  
  // Data States
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [certRequests, setCertRequests] = useState<any[]>([]);
  const [pendingCertificates, setPendingCertificates] = useState<any[]>([]);
  const [clientRequirements, setClientRequirements] = useState<any[]>([]);
  const [clientRequirementsCount, setClientRequirementsCount] = useState(0);
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
  const [pendingProjectsCount, setPendingProjectsCount] = useState(0);
  const [pendingClientRequestsCount, setPendingClientRequestsCount] = useState(0);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [homeContent, setHomeContent] = useState<any>({ heroTitle: '', heroSubtitle: '' });
  const [adminCreds, setAdminCreds] = useState<any>({ username: 'admin', password: 'ram' });
  
  const [currentUsernameInput, setCurrentUsernameInput] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      router.push('/kn2026');
    }

    // Listen to Firebase Data (Optimized Granular Fetch)
    const loadData = () => {
      setIsRefreshing(true);
      const unsubscribers: any[] = [];
      const listen = (node: string, callback: (data: any) => void) => {
        const u = onValue(ref(db, node), (snap) => callback(snap.val()));
        unsubscribers.push(u);
      };

      listen('services', d => d ? setServices(Object.keys(d).map(k => ({ id: k, ...d[k] })).sort((a, b) => (a.order || 0) - (b.order || 0))) : setServices([]));
      listen('projects', d => d ? setProjects(Object.keys(d).map(k => ({ id: k, ...d[k] })).sort((a, b) => (a.order || 0) - (b.order || 0))) : setProjects([]));
      listen('team', d => d ? setTeam(Object.keys(d).map(k => ({ id: k, ...d[k] })).sort((a, b) => (a.order || 0) - (b.order || 0))) : setTeam([]));
      listen('pricing', d => d ? setPricing(Object.keys(d).map(k => ({ id: k, ...d[k] })).sort((a, b) => (a.order || 0) - (b.order || 0))) : setPricing([]));
      listen('reviews', d => d ? setReviews(Object.keys(d).map(k => ({ id: k, ...d[k] })).sort((a, b) => (a.order || 0) - (b.order || 0))) : setReviews([]));
      listen('blogs', d => d ? setBlogs(Object.keys(d).map(k => ({ id: k, ...d[k] })).sort((a, b) => (a.order || 0) - (b.order || 0))) : setBlogs([]));
      listen('leads', d => d ? setLeads(Object.keys(d).map(k => ({ id: k, ...d[k] }))) : setLeads([]));
      listen('logs/logins', d => d ? setLoginLogs(Object.values(d)) : setLoginLogs([]));
      listen('certificate_requests', d => d ? setCertRequests(Object.values(d)) : setCertRequests([]));
      listen('pending_employees', d => d ? setPendingRegistrations(Object.keys(d).map(k => ({ id: k, ...d[k] }))) : setPendingRegistrations([]));
      
      listen('assigned_projects', d => {
        let pCount = 0;
        if (d) {
          Object.values(d).forEach((empProjs: any) => {
            Object.values(empProjs).forEach((proj: any) => {
              if (proj.status === 'submitted_full' || proj.status === 'submitted_half') pCount++;
            });
          });
        }
        setPendingProjectsCount(pCount);
      });

      listen('client_requests', d => d ? setPendingClientRequestsCount(Object.keys(d).length) : setPendingClientRequestsCount(0));
      listen('client_requirements', d => {
        if (d) {
          const reqs = Object.keys(d).map(key => ({ id: key, ...d[key] }));
          setClientRequirements(reqs.reverse());
          setClientRequirementsCount(reqs.filter((r: any) => r.status === 'Pending').length);
        } else {
          setClientRequirements([]);
          setClientRequirementsCount(0);
        }
      });
      listen('home', d => d ? setHomeContent(d) : null);
      listen('admin', d => d ? setAdminCreds(d) : null);

      setTimeout(() => setIsRefreshing(false), 800);
      return () => unsubscribers.forEach(u => u());
    };
    
    const cleanup = loadData();
    return cleanup;
  }, [router, refreshTrigger]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/kn2026');
  };

  const sessionTimeLeft = useInactivityTimeout(() => {
    handleLogout();
  }, 30 * 60 * 1000);

  const formatSessionTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const showSaveSuccess = () => {
    setSaveMessage('Saved Successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // --- Handlers ---
  const saveHomeContent = async () => {
    setIsSaving(true);
    await set(ref(db, 'home'), homeContent);
    setIsSaving(false);
    showSaveSuccess();
  };

  const saveAdminCreds = async () => {
    if (currentUsernameInput !== adminCreds?.username || currentPasswordInput !== adminCreds?.password) {
      alert("Current Username or Password is incorrect!");
      return;
    }
    if (!newUsernameInput || !newPasswordInput) {
      alert("New Username and Password cannot be empty!");
      return;
    }
    setIsSaving(true);
    const newCreds = { username: newUsernameInput, password: newPasswordInput };
    await set(ref(db, 'admin'), newCreds);
    setAdminCreds(newCreds);
    setCurrentUsernameInput('');
    setCurrentPasswordInput('');
    setNewUsernameInput('');
    setNewPasswordInput('');
    setIsSaving(false);
    showSaveSuccess();
    alert("Admin credentials updated successfully. Please use the new details next time.");
  };

  const handleListChange = (list: any[], setList: any, index: number, field: string, value: any) => {
    const newList = [...list];
    newList[index][field] = value;
    setList(newList);
  };

  const saveList = async (node: string, list: any[]) => {
    setIsSaving(true);
    const updates: any = {};
    list.forEach(item => {
      const id = item.id || push(ref(db, node)).key;
      const { id: _, ...data } = item;
      updates[`${node}/${id}`] = data;
    });
    // Remove deleted items logic can be more complex, for now we will just overwrite entire node
    const formattedList: any = {};
    list.forEach((item, index) => {
      const { id, ...data } = item;
      formattedList[id || push(ref(db)).key] = { ...data, order: index };
    });
    
    if (Object.keys(formattedList).length === 0) {
      await remove(ref(db, node));
    } else {
      await set(ref(db, node), formattedList);
    }
    setIsSaving(false);
    showSaveSuccess();
  };

  const addItem = (list: any[], setList: any, template: any) => {
    setList([...list, { id: `new_${Date.now()}`, ...template }]);
  };

  const removeItem = (list: any[], setList: any, index: number, nodeName: string) => {
    const newList = [...list];
    newList.splice(index, 1);
    setList(newList);
    saveList(nodeName, newList);
  };

  // --- Seed Data Initializer ---
  const seedDatabase = async () => {
    setIsSaving(true);
    const defaultData = {
      admin: { username: 'admin', password: 'ram' },
      home: { 
        heroTitle: 'WHERE VISION MEETS TECHNOLOGY', 
        heroSubtitle: 'Premium digital marketing and tech solutions engineered to accelerate business growth.' 
      },
      services: {
        s1: { title: 'Meta & Google Ads', desc: 'High-converting ad campaigns.' },
        s2: { title: 'Social Media Marketing', desc: 'Brand presence and growth.' },
        s3: { title: 'Branding & Events', desc: 'Memorable brand experiences.' },
      },
      pricing: {
        p1: { name: 'Starter', price: '$499', features: 'Basic ads, monthly reporting' },
        p2: { name: 'Pro', price: '$999', features: 'Full social management, weekly reports' }
      },
      team: {
        t1: { name: 'Shourya Sharma', role: 'Co-Founder & CEO', desc: 'Full-Stack Developer, Performance Marketer, and Business Growth Architect.', image: '/founder.jpg', linkedin: 'https://linkedin.com/in/shouryasharma2809', github: 'https://github.com/shourya251003-d-sys' },
        t2: { name: 'Vikram Singh Parmar', role: 'Co-Founder & CTO', desc: 'Systems Architect, Frontend & Backend Engineer, and Cloud Solutions Expert.', image: '/founder_vikram.jpg', linkedin: 'https://linkedin.com/in/vikram-singh-parmar-24ba3020', github: '' }
      }
    };
    await set(ref(db, '/'), defaultData);
    setIsSaving(false);
    showSaveSuccess();
    alert('Database seeded successfully!');
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'projects', label: 'Complete Projects', icon: ImageIcon },
    { id: 'pricing', label: 'Pricing Plans', icon: FileText },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'blogs', label: 'Blogs', icon: FileText },
    { id: 'leads', label: 'Contact Form Leads', icon: MessageSquare },
    { id: 'employees', label: 'Employees', icon: UserCheck },
    { id: 'id_cards', label: 'ID Cards', icon: CreditCard },
    { id: 'pending_registrations', label: 'Registrations', icon: UserPlus },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle },
    { id: 'assign_project', label: 'Assign Project', icon: Send },
    { id: 'approve_projects', label: 'Approve Project', icon: Save },
    { id: 'clients', label: 'All Clients', icon: Users },
    { id: 'client_requests', label: 'Client Signups', icon: UserPlus },
    { id: 'client_requirements', label: 'Requirements', icon: FileText },
    { id: 'client_projects', label: 'Client Projects', icon: Briefcase },
    { id: 'payment_history', label: 'Payment History', icon: IndianRupee },
    { id: 'theme_cms', label: 'Theme CMS', icon: ImageIcon },
    { id: 'team', label: 'Founders', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-bg-primary min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative top-0 left-0 h-screen w-[280px] md:w-64 bg-bg-card border-r border-black/20 dark:border-white/10 flex flex-col z-50 transform transition-transform duration-300 flex-shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-black/20 dark:border-white/10 flex items-center justify-between">
          <h2 className="font-orbitron font-bold text-lg text-text-primary uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-primary animate-pulse" />
            Admin Portal
          </h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-text-muted hover:text-text-primary">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex flex-col py-4 md:py-6 px-4 gap-2 overflow-y-auto overscroll-contain flex-1 scroll-smooth">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all flex-shrink-0 w-full ${
                activeTab === item.id 
                  ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary shadow-[0_0_8px_rgba(212,175,55,0.4)] font-bold' 
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-surface border border-transparent'
              }`}
            >
              <item.icon size={18} />
              <span className="font-rajdhani font-semibold tracking-wide">{item.label}</span>
              {item.id === 'approve_projects' && pendingProjectsCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  {pendingProjectsCount}
                </span>
              )}
              {item.id === 'client_requests' && pendingClientRequestsCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">{pendingClientRequestsCount}</span>
              )}
              {item.id === 'client_requirements' && clientRequirementsCount > 0 && (
                <span className="ml-auto bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">{clientRequirementsCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-black/20 dark:border-white/10 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-rajdhani font-semibold tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col h-[calc(100vh-140px)] md:h-screen w-full overflow-hidden">
        <header className="flex-shrink-0 h-16 md:h-20 border-b-2 border-gold-primary/60 bg-bg-primary/50 backdrop-blur-md flex items-center justify-between px-2 md:px-8 z-10 w-full shadow-[0_4px_20px_rgba(212,175,55,0.15)] relative">
          {/* Subtle bottom glow line for header */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-80"></div>
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 text-text-primary"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={handleLogout}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-red-500/10 text-xs text-red-400 border border-red-500/20"
            >
              <LogOut size={12} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          <div className="flex justify-center flex-shrink-0 scale-90 md:scale-100 transform origin-center">
            <div className="flex items-center gap-1 md:gap-2">
              <button 
                onClick={handleBack} 
                disabled={currentHistoryIndex === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-surface border border-gold-primary/20 text-gold-primary hover:bg-gold-primary/10 transition-colors disabled:opacity-30 disabled:hover:bg-bg-surface disabled:cursor-not-allowed"
                title="Go Back"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-2 text-gold-primary bg-gold-primary/10 px-4 py-1.5 rounded-full border border-gold-primary/20 shadow-sm">
                <Clock size={14} className="opacity-70" />
                <span className="text-xs font-rajdhani font-bold tracking-widest uppercase">
                  Session: <span className="font-mono text-text-primary ml-1">{formatSessionTime(sessionTimeLeft)}</span>
                </span>
              </div>

              <button 
                onClick={handleForward} 
                disabled={currentHistoryIndex === tabHistory.length - 1}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-surface border border-gold-primary/20 text-gold-primary hover:bg-gold-primary/10 transition-colors disabled:opacity-30 disabled:hover:bg-bg-surface disabled:cursor-not-allowed"
                title="Go Forward"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="hidden md:block flex-1" />
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-4">
            {saveMessage && (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 animate-fade-in">
                <CheckCircle size={12} /> {saveMessage}
              </div>
            )}
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
                setRefreshTrigger(prev => prev + 1);
                setTimeout(() => setIsRefreshing(false), 500);
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

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 z-10 w-full">
          <div className="flex flex-col gap-4 mb-8 w-full">
            <div className="flex items-center gap-4">
              {editingIndex !== null && (
                <button onClick={() => setEditingIndex(null)} className="text-sm font-bold text-gold-primary hover:text-white px-4 py-2 rounded-full hover:bg-gold-primary/10 transition-colors flex items-center gap-2 border border-gold-primary/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                  &larr; Back
                </button>
              )}
              <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-primary to-yellow-200 tracking-wider">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
            </div>
            {/* Premium Golden Title Separator */}
            <div className="h-[2px] w-full max-w-4xl bg-gradient-to-r from-gold-primary via-gold-primary/40 to-transparent rounded-full shadow-[0_2px_10px_rgba(212,175,55,0.3)]"></div>
          </div>
          
          {/* OVERVIEW TAB (DASHBOARD) */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {pendingRegistrations.length > 0 && (
                <div className="bg-gold-primary/10 border border-gold-primary/30 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserPlus size={24} className="text-gold-primary" />
                    <div>
                      <h4 className="font-orbitron font-bold text-text-primary">New Employee Registrations Pending</h4>
                      <p className="text-sm font-rajdhani text-text-muted">You have {pendingRegistrations.length} new application(s) awaiting approval.</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('pending_registrations')} className="bg-gold-primary text-black font-rajdhani font-bold px-4 py-2 rounded-lg text-sm hover:bg-gold-light transition-colors">
                    Review Now
                  </button>
                </div>
              )}
              {pendingProjectsCount > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <FileCheck size={24} className="text-blue-500" />
                    <div>
                      <h4 className="font-orbitron font-bold text-text-primary">Project Submissions Pending</h4>
                      <p className="text-sm font-rajdhani text-text-muted">You have {pendingProjectsCount} project(s) awaiting your approval.</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('approve_projects')} className="bg-blue-500 text-white font-rajdhani font-bold px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                    Review Now
                  </button>
                </div>
              )}
              <img src="/banner.png" alt="Kalvix Nexus Banner" className="w-full h-auto max-h-[300px] object-cover rounded-xl border border-gold-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)] mb-6" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Login Logs Panel */}
                <div className="bg-bg-card border border-gold-primary/10 rounded-xl p-6">
                  <h3 className="font-orbitron font-bold text-lg mb-4 text-text-primary flex items-center gap-2"><Shield size={18} className="text-gold-primary"/> Recent Logins</h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {loginLogs.length === 0 ? <p className="text-sm text-text-muted font-rajdhani">No logins recorded.</p> : null}
                    {loginLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20).map((log, i) => (
                      <div key={i} className="flex flex-col p-3 bg-bg-surface rounded-lg border border-gold-primary/5 hover:border-gold-primary/30 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${log.role === 'Admin' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>{log.role}</span>
                          <span className="text-xs text-text-muted font-rajdhani">{new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-text-primary font-rajdhani font-semibold">{log.username}</span>
                          <span className="text-xs text-text-primary font-mono bg-bg-surface border border-gold-primary/20 px-2 py-1 rounded">{log.ip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Certificate Requests Panel */}
                  <div className="bg-bg-card border border-gold-primary/10 rounded-xl p-6">
                    <h3 className="font-orbitron font-bold text-lg mb-4 text-text-primary flex items-center gap-2"><Award size={18} className="text-gold-primary"/> Pending Certificate Requests</h3>
                    <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                      {certRequests.filter(r => r.status === 'pending').length === 0 ? <p className="text-sm text-text-muted font-rajdhani">No pending requests.</p> : null}
                      {certRequests.filter(r => r.status === 'pending').sort((a,b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()).slice(0, 10).map((req: any, i: number) => (
                        <div key={i} className="p-3 bg-bg-surface rounded-lg border border-gold-primary/5 flex flex-col gap-1">
                          <div className="flex justify-between items-start">
                            <p className="text-sm text-text-primary font-bold font-rajdhani">{req.certificate_title}</p>
                            <span className="text-[10px] text-gold-primary border border-gold-primary/30 px-2 py-0.5 rounded uppercase tracking-wider">Pending</span>
                          </div>
                          <p className="text-xs text-text-muted font-rajdhani">Requested by: <span className="text-text-primary">{req.employee_name}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Leads Panel */}
                  <div className="bg-bg-card border border-gold-primary/10 rounded-xl p-6">
                    <h3 className="font-orbitron font-bold text-lg mb-4 text-text-primary flex items-center gap-2"><MessageSquare size={18} className="text-gold-primary"/> Recent Contact Leads</h3>
                    <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                      {leads.length === 0 ? <p className="text-sm text-text-muted font-rajdhani">No leads received.</p> : null}
                      {leads.slice(-10).reverse().map((lead, i) => (
                        <div key={i} className="p-3 bg-bg-surface rounded-lg border border-gold-primary/5 hover:border-gold-primary/30 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm text-text-primary font-bold font-rajdhani">{lead.name}</p>
                            <span className="text-[10px] text-text-muted font-rajdhani">{new Date(lead.timestamp || Date.now()).toLocaleDateString('en-IN')}</span>
                          </div>
                          <p className="text-xs text-gold-primary mb-2 font-mono">{lead.email}</p>
                          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{lead.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="max-w-2xl bg-bg-card border border-gold-primary/20 p-6 rounded-xl">
              <h3 className="text-lg font-orbitron font-bold text-text-primary mb-4">Hero Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-rajdhani text-text-muted uppercase tracking-widest mb-1 block">Hero Title</label>
                  <input type="text" value={homeContent.heroTitle} onChange={(e) => setHomeContent({...homeContent, heroTitle: e.target.value})} className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary" />
                </div>
                <div>
                  <label className="text-xs font-rajdhani text-text-muted uppercase tracking-widest mb-1 block">Hero Subtitle</label>
                  <textarea value={homeContent.heroSubtitle} onChange={(e) => setHomeContent({...homeContent, heroSubtitle: e.target.value})} className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary h-24" />
                </div>
                <button onClick={saveHomeContent} disabled={isSaving} className="bg-gold-primary text-black px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                  <Save size={16} /> Save Home Content
                </button>
              </div>
            </div>
          )}

          {/* LEADS TAB — read-only inbox view */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-orbitron font-bold text-text-primary">Contact Form Leads</h3>
                  <p className="text-xs text-text-muted mt-1">{leads.length} submission{leads.length !== 1 ? 's' : ''} received</p>
                </div>
                {leads.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Delete all leads? This cannot be undone.')) {
                        remove(ref(db, 'leads'));
                      }
                    }}
                    className="text-xs text-red-400 border border-red-400/30 px-3 py-1.5 rounded hover:bg-red-400/10 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-20 text-text-muted">
                  <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-rajdhani">No leads yet. Contact form submissions will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...leads].reverse().map((lead: any, i: number) => (
                    <div key={lead.id || i} className="bg-bg-card border border-gold-primary/10 hover:border-gold-primary/30 p-6 rounded-xl transition-all duration-200">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap gap-4 items-center">
                            <div className="w-10 h-10 rounded-full bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center text-gold-primary font-orbitron font-black text-sm flex-shrink-0">
                              {lead.name ? lead.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <p className="font-orbitron font-bold text-sm text-text-primary">{lead.name || '—'}</p>
                              <p className="text-xs text-gold-primary mt-0.5">{lead.email || '—'}</p>
                            </div>
                            {lead.phone && (
                              <span className="text-xs text-text-muted border border-gold-primary/10 px-2 py-0.5 rounded-full">{lead.phone}</span>
                            )}
                            {lead.timestamp && (
                              <span className="text-[10px] text-text-muted ml-auto">
                                {new Date(lead.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                            )}
                          </div>
                          {lead.message && (
                            <div className="bg-bg-surface border border-gold-primary/5 p-4 rounded-lg">
                              <p className="text-[11px] font-rajdhani font-bold text-gold-primary uppercase tracking-wider mb-1">Message</p>
                              <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap">{lead.message}</p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            remove(ref(db, `leads/${lead.id}`));
                          }}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded flex-shrink-0"
                          title="Delete lead"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DYNAMIC LIST TABS (Services, Projects, Team, Pricing, Reviews, Blogs) */}
          {['services', 'projects', 'team', 'pricing', 'reviews', 'blogs'].includes(activeTab) && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <div></div>
                <button 
                  onClick={() => {
                    let template: any = { title: '', desc: '' };
                    if (activeTab === 'pricing') template = { name: '', price: '', period: '', desc: '', features: '', popular: false, cta: '' };
                    if (activeTab === 'team') template = { name: '', role: '', desc: '', image: '', linkedin: '', github: '', signature: '' };
                    if (activeTab === 'projects') template = { title: '', category: '', desc: '', image: '', stats: '', link: '' };
                    if (activeTab === 'services') template = { title: '', category: '', desc: '', icon: 'Code', image: '', tools: '', rate: '', deliverables: '' };
                    if (activeTab === 'reviews') template = { name: '', role: '', company: '', text: '', rating: '5' };
                    if (activeTab === 'blogs') template = { title: '', author: '', date: '', content: '', image: '', tags: '' };
                    
                    const listMap: any = { services, projects, team, pricing, reviews, blogs: blogs };
                    const setListMap: any = { services: setServices, projects: setProjects, team: setTeam, pricing: setPricing, reviews: setReviews, blogs: setBlogs };
                    addItem(listMap[activeTab], setListMap[activeTab], template);
                  }}
                  className="bg-gold-primary/20 text-gold-primary px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
                >
                  <Plus size={16} /> Add New
                </button>
              </div>

              {(() => {
                const listMap: any = { services, projects, team, pricing, reviews, blogs: blogs };
                const setListMap: any = { services: setServices, projects: setProjects, team: setTeam, pricing: setPricing, reviews: setReviews, blogs: setBlogs };
                const list = listMap[activeTab];
                const setList = setListMap[activeTab];

                const isTeam = activeTab === 'team';
                return (
                  <div className={isTeam && editingIndex === null ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" : "space-y-4"}>
                    {list.map((item: any, i: number) => {
                      if (editingIndex !== null && editingIndex !== i) return null;
                      
                      const isCollapsibleTab = true;
                      const isEditing = !isCollapsibleTab || editingIndex === i;

                      if (isTeam && !isEditing) {
                        return (
                          <div 
                            key={item.id || i} 
                            className="bg-bg-card border border-gold-primary/20 rounded-xl overflow-hidden group cursor-pointer hover:border-gold-primary/50 transition-all hover:-translate-y-1 shadow-lg" 
                            onClick={() => setEditingIndex(i)}
                          >
                            <div className="h-[22rem] bg-black/10 dark:bg-black/50 relative">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-muted font-rajdhani text-sm">No Image</div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/40 to-transparent opacity-100"></div>
                            </div>
                            <div className="p-5 -mt-20 relative z-10 flex flex-col items-center text-center">
                              <h4 className="font-orbitron font-bold text-xl text-gold-primary mb-1">{item.name || 'New Founder'}</h4>
                              <p className="text-sm text-text-muted font-rajdhani tracking-widest uppercase mb-4 font-bold">{item.role || 'Role'}</p>
                              <button className="text-[10px] uppercase tracking-widest bg-gold-primary/10 text-gold-primary px-4 py-1.5 rounded-full border border-gold-primary/30 group-hover:bg-gold-primary group-hover:text-black transition-colors">
                                Edit Profile
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                      <div 
                        key={item.id || i} 
                        className={`${isTeam && isEditing ? 'col-span-full ' : ''}bg-bg-card border border-gold-primary/20 p-4 rounded-xl flex gap-4 items-start ${!isEditing ? 'cursor-grab active:cursor-grabbing hover:border-gold-primary/40' : ''}`}
                        draggable={!isEditing}
                        onDragStart={!isEditing ? (e) => handleDragStart(e, i) : undefined}
                        onDragEnd={!isEditing ? handleDragEnd : undefined}
                        onDragOver={!isEditing ? handleDragOver : undefined}
                        onDrop={!isEditing ? (e) => handleDrop(e, i, activeTab, list, setList) : undefined}
                      >
                        {!isEditing && (
                          <div className="flex items-center justify-center pt-5 text-gold-primary/30 hover:text-gold-primary transition-colors cursor-grab active:cursor-grabbing">
                            <GripVertical size={20} />
                          </div>
                        )}
                        <div className="flex-1">
                          {!isEditing ? (
                            <div 
                              className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                              onClick={() => setEditingIndex(i)}
                            >
                              <div className="w-16 h-16 bg-black/50 rounded overflow-hidden flex-shrink-0 border border-gold-primary/20 flex items-center justify-center text-gold-primary">
                                {item.image ? (
                                  <img src={item.image} alt={item.title || 'Preview'} className="w-full h-full object-cover" />
                                ) : item.icon ? (
                                  <span className="font-bold text-xs">{item.icon}</span>
                                ) : activeTab === 'reviews' ? (
                                  <div className="flex flex-wrap items-center justify-center gap-1 px-1">
                                    {Array.from({ length: item.rating || 5 }).map((_, idx) => (
                                      <Star key={idx} size={10} className="fill-gold-primary text-gold-primary" />
                                    ))}
                                  </div>
                                ) : activeTab === 'pricing' ? (
                                  <span className="font-bold text-xs text-center leading-tight px-1">{item.price || 'N/A'}</span>
                                ) : (
                                  <span className="text-[10px] text-text-muted">No Img</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-orbitron font-bold text-text-primary text-sm">{item.title || item.name || item.client || item.company || 'Untitled Item'}</h4>
                                  {activeTab === 'reviews' && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.approved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                                      {item.approved ? 'Approved' : 'Pending'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-text-muted mt-1">{item.category || item.role || item.date || item.company || 'No Category'}</p>
                              </div>
                              <div className="flex gap-2">
                                {activeTab === 'reviews' && !item.approved && (
                                  <>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newList = [...list];
                                        newList[i].approved = true;
                                        setList(newList);
                                        saveList(activeTab, newList);
                                      }} 
                                      className="text-emerald-400 text-[10px] uppercase tracking-widest border border-emerald-400/30 px-3 py-1.5 rounded hover:bg-emerald-400/10 transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newList = list.filter((_: any, idx: number) => idx !== i);
                                        setList(newList);
                                        saveList(activeTab, newList);
                                      }} 
                                      className="text-red-400 text-[10px] uppercase tracking-widest border border-red-400/30 px-3 py-1.5 rounded hover:bg-red-400/10 transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                <button className="text-gold-primary text-[10px] uppercase tracking-widest border border-gold-primary/30 px-3 py-1.5 rounded hover:bg-gold-primary/10 transition-colors">
                                  Edit
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {isCollapsibleTab && (
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gold-primary/10">
                                  <span className="font-orbitron font-bold text-gold-primary text-xs uppercase tracking-widest">Editing {activeTab === 'projects' ? 'Project' : activeTab === 'team' ? 'Founder' : activeTab === 'blogs' ? 'Blog' : 'Service'}</span>
                                </div>
                              )}
                              {(activeTab === 'team' ? Object.keys({ name: '', role: '', desc: '', image: '', linkedin: '', github: '', signature: '', ...item }) : activeTab === 'services' ? Object.keys({ title: '', category: '', desc: '', icon: '', image: '', tools: '', rate: '', deliverables: '', ...item }) : activeTab === 'blogs' ? Object.keys({ title: '', author: '', date: '', content: '', image: '', tags: '', ...item }) : Object.keys(item)).map(key => {
                                if (key === 'id') return null;
                                return (
                              <div key={key}>
                                  <label className="text-xs font-rajdhani text-text-muted uppercase tracking-widest mb-1 block">{key}</label>
                                {key === 'image' || key === 'signature' ? (
                                  <div className="flex flex-col gap-2">
                                    <div className="flex gap-2 items-center">
                                      {item[key] && <img src={item[key]} alt="Preview" className="w-10 h-10 object-cover rounded border border-gold-primary/30" />}
                                      <input 
                                        type="text" 
                                        value={item[key] || ''} 
                                        onChange={(e) => handleListChange(list, setList, i, key, e.target.value)} 
                                        placeholder="Paste image URL here..."
                                        className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" 
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-text-muted font-rajdhani uppercase tracking-widest whitespace-nowrap">OR Upload:</span>
                                      <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = async () => {
                                              const base64 = reader.result as string;
                                              const { uploadToCloudinary } = await import('@/lib/cloudinary');
                                              const url = await uploadToCloudinary(base64);
                                              if (url) {
                                                handleListChange(list, setList, i, key, url);
                                              } else {
                                                alert('Failed to upload image.');
                                              }
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }} 
                                        className="w-full bg-bg-surface border border-gold-primary/20 rounded p-1.5 text-sm text-text-primary file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gold-primary/20 file:text-gold-primary hover:file:bg-gold-primary/30 cursor-pointer" 
                                      />
                                    </div>
                                  </div>
                                ) : typeof item[key] === 'boolean' || key === 'approved' ? (
                                  <div className="flex items-center gap-2 mt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleListChange(list, setList, i, key, !item[key])}
                                      className={`w-12 h-6 rounded-full p-1 transition-colors ${item[key] ? 'bg-emerald-500' : 'bg-bg-surface border border-gray-600'}`}
                                    >
                                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${item[key] ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                    <span className="text-xs text-text-muted">{item[key] ? 'Approved for Public' : 'Pending Approval'}</span>
                                  </div>
                                ) : key === 'period' ? (
                                  <select
                                    value={item[key] || ''}
                                    onChange={(e) => handleListChange(list, setList, i, key, e.target.value)}
                                    className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors appearance-none cursor-pointer"
                                  >
                                    <option value="">Select Period...</option>
                                    <option value="Month">Month</option>
                                    <option value="Year">Year</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="One-Time">One-Time</option>
                                  </select>
                                ) : key === 'cta' ? (
                                  <select
                                    value={item[key] || ''}
                                    onChange={(e) => handleListChange(list, setList, i, key, e.target.value)}
                                    className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors appearance-none cursor-pointer"
                                  >
                                    <option value="">Select CTA Text...</option>
                                    <option value="Get Started">Get Started</option>
                                    <option value="Choose Plan">Choose Plan</option>
                                    <option value="Contact Us">Contact Us</option>
                                    <option value="Buy Now">Buy Now</option>
                                    <option value="Subscribe">Subscribe</option>
                                  </select>
                                ) : key === 'date' ? (
                                  <input 
                                    type="date" 
                                    value={item[key]} 
                                    onChange={(e) => handleListChange(list, setList, i, key, e.target.value)} 
                                    className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors"
                                    style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                                  />
                                ) : key === 'content' || key === 'desc' || key === 'deliverables' ? (
                                  <textarea
                                    value={item[key] || ''}
                                    ref={(el) => {
                                      if (el) {
                                        el.style.height = 'auto';
                                        el.style.height = el.scrollHeight + 'px';
                                      }
                                    }}
                                    onChange={(e) => {
                                      e.target.style.height = 'auto';
                                      e.target.style.height = e.target.scrollHeight + 'px';
                                      handleListChange(list, setList, i, key, e.target.value);
                                    }}
                                    rows={3}
                                    className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors resize-none overflow-hidden"
                                  />
                                ) : (
                                  <input 
                                    type="text" 
                                    value={item[key] || ''} 
                                    onChange={(e) => handleListChange(list, setList, i, key, e.target.value)} 
                                    className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors" 
                                  />
                                )}
                                </div>
                            );
                          })}
                          
                          <div className="pt-4 mt-2 border-t border-gold-primary/10 flex justify-end">
                            <button 
                              onClick={() => {
                                saveList(activeTab, list);
                                setEditingIndex(null);
                              }} 
                              disabled={isSaving} 
                              className="bg-gold-primary text-black px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-gold hover:bg-gold-light hover:-translate-y-0.5 transition-all disabled:opacity-50"
                            >
                              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                          )}
                        </div>
                        <button onClick={() => removeItem(list, setList, i, activeTab)} className="p-2 text-red-400 hover:bg-red-400/10 rounded mt-2">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )})}
                    
                    {list.length === 0 && (
                      <div className="text-center py-8 text-text-muted">No items found. Click 'Add Item' to create one.</div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* CLIENT SIGNUP REQUESTS */}
          {activeTab === 'client_requests' && (
            <div className="animate-fade-in">
              <ClientRequests />
            </div>
          )}

          {activeTab === 'client_requirements' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-bg-card border border-gold-primary/20 p-6 rounded-xl shadow-lg">
                <div>
                  <h2 className="font-orbitron font-bold text-xl text-gold-primary tracking-widest uppercase">Project Requirements</h2>
                  <p className="text-text-muted text-sm mt-1">Requirements submitted by existing clients.</p>
                </div>
              </div>

              {clientRequirements.length === 0 ? (
                <div className="text-center p-8 bg-bg-card border border-gold-primary/20 rounded-xl">
                  <p className="text-text-muted">No requirements submitted yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {clientRequirements.map((req: any) => (
                    <div key={req.id} className="bg-bg-card border border-gold-primary/20 rounded-xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-orbitron font-bold text-lg text-text-primary">{req.projectName}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              req.status === 'Pending' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                              req.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-1 font-rajdhani uppercase tracking-widest">Client: {req.companyName} ({req.clientId})</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gold-primary bg-gold-primary/10 px-3 py-1 rounded-full border border-gold-primary/20">Deadline: {req.deadline}</p>
                          <p className="text-[10px] text-text-muted mt-2">{new Date(req.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="bg-bg-surface border border-gold-primary/10 rounded-lg p-4 mb-4">
                        <p className="text-sm text-text-primary whitespace-pre-wrap">{req.description}</p>
                      </div>

                      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gold-primary/10">
                        {req.status === 'Pending' && (
                          <>
                            <button 
                              onClick={async () => {
                                const reason = window.prompt("Enter reason for rejection:");
                                if (reason !== null && reason.trim() !== "") {
                                  try {
                                    await update(ref(db, `client_requirements/${req.id}`), { status: 'Rejected', rejectionReason: reason.trim() });
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }
                              }}
                              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-6 py-2 rounded-lg text-sm font-bold tracking-wider transition-colors border border-red-500/30 flex items-center gap-2"
                            >
                              <X size={16} /> Reject
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  await update(ref(db, `client_requirements/${req.id}`), { status: 'Reviewed' });
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-6 py-2 rounded-lg text-sm font-bold tracking-wider transition-colors border border-emerald-500/30 flex items-center gap-2"
                            >
                              <CheckCircle size={16} /> Mark as Reviewed
                            </button>
                          </>
                        )}
                        <button 
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this requirement?')) {
                              try {
                                await remove(ref(db, `client_requirements/${req.id}`));
                              } catch (e) {
                                console.error(e);
                              }
                            }
                          }}
                          className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm font-bold tracking-wider transition-colors border border-red-500/30 flex items-center gap-2"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CLIENTS LIST */}
          {activeTab === 'clients' && (
            <div className="animate-fade-in">
              <ClientsList />
            </div>
          )}

          {/* CLIENT PROJECTS */}
          {activeTab === 'client_projects' && (
            <div className="animate-fade-in">
              <ClientProjects />
            </div>
          )}

          {/* PAYMENT HISTORY */}
          {activeTab === 'payment_history' && (
            <div className="animate-fade-in">
              <PaymentHistory />
            </div>
          )}

          {/* EMPLOYEES TAB */}
          {activeTab === 'employees' && (
            <div className="animate-fade-in">
              <EmployeeModule />
            </div>
          )}

          {/* REGISTRATIONS TAB */}
          {activeTab === 'pending_registrations' && (
            <div className="animate-fade-in">
              <PendingRegistrationsModule pendingRegistrations={pendingRegistrations} />
            </div>
          )}

          {/* ID CARDS TAB */}
          {activeTab === 'id_cards' && (
            <div className="animate-fade-in">
              <IdCardsModule />
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <AttendanceModule />
          )}

          {activeTab === 'theme_cms' && (
            <ThemeCMSModule />
          )}

          {/* ASSIGN PROJECT TAB */}
          {activeTab === 'assign_project' && (
            <AssignProjectModule />
          )}

          {/* APPROVE PROJECTS TAB */}
          {activeTab === 'approve_projects' && (
            <ApproveProjectsModule />
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-bg-card border border-gold-primary/20 p-6 rounded-xl">
              <h3 className="text-lg font-orbitron font-bold text-text-primary mb-4">Admin Credentials</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-rajdhani text-text-muted uppercase tracking-widest mb-1 block">Current Username</label>
                  <input type="text" value={currentUsernameInput} onChange={(e) => setCurrentUsernameInput(e.target.value)} placeholder="Enter current username" className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary" />
                </div>
                <div>
                  <label className="text-xs font-rajdhani text-text-muted uppercase tracking-widest mb-1 block">Current Password</label>
                  <input type="password" value={currentPasswordInput} onChange={(e) => setCurrentPasswordInput(e.target.value)} placeholder="Enter current password" className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary" />
                </div>
                <div className="pt-4 border-t border-gold-primary/10">
                  <label className="text-xs font-rajdhani text-text-muted uppercase tracking-widest mb-1 block">New Username</label>
                  <input type="text" value={newUsernameInput} onChange={(e) => setNewUsernameInput(e.target.value)} placeholder="Enter new username" className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary" />
                </div>
                <div>
                  <label className="text-xs font-rajdhani text-text-muted uppercase tracking-widest mb-1 block">New Password</label>
                  <input type="password" value={newPasswordInput} onChange={(e) => setNewPasswordInput(e.target.value)} placeholder="Enter new password" className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary" />
                </div>
                <button onClick={saveAdminCreds} disabled={isSaving} className="bg-gold-primary text-black px-4 py-2 rounded text-sm font-bold flex items-center gap-2 mt-2">
                  <Save size={16} /> Update Credentials
                </button>
              </div>
            </div>
          )}

        </div>
        {/* Admin Dashboard Welcome Popup */}
        {showWelcomePopup && (pendingProjectsCount > 0 || pendingRegistrations.length > 0 || certRequests.filter(r => r.status === 'pending').length > 0) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
            <div className="bg-bg-card border border-gold-primary/30 p-8 rounded-2xl w-full max-w-md shadow-2xl relative text-center">
              <div className="w-16 h-16 bg-gold-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck size={32} className="text-gold-primary animate-bounce" />
              </div>
              <h3 className="text-2xl font-orbitron font-bold text-text-primary mb-2">Pending Actions</h3>
              <p className="text-text-muted text-sm font-rajdhani mb-6">
                You have new tasks that require your attention.
              </p>
              
              <div className="space-y-3 mb-6 text-left">
                {pendingProjectsCount > 0 && (
                  <div className="flex justify-between items-center bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                    <span className="text-sm font-rajdhani font-bold text-text-primary">{pendingProjectsCount} Project Approval(s)</span>
                    <button onClick={() => { setActiveTab('approve_projects'); setShowWelcomePopup(false); }} className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600">Review</button>
                  </div>
                )}
                {pendingRegistrations.length > 0 && (
                  <div className="flex justify-between items-center bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                    <span className="text-sm font-rajdhani font-bold text-text-primary">{pendingRegistrations.length} Registration(s)</span>
                    <button onClick={() => { setActiveTab('pending_registrations'); setShowWelcomePopup(false); }} className="text-xs bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600">Review</button>
                  </div>
                )}
                {certRequests.filter(r => r.status === 'pending').length > 0 && (
                  <div className="flex justify-between items-center bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                    <span className="text-sm font-rajdhani font-bold text-text-primary">{certRequests.filter(r => r.status === 'pending').length} Certificate Request(s)</span>
                    <button onClick={() => { setActiveTab('overview'); setShowWelcomePopup(false); }} className="text-xs bg-yellow-500 text-black px-3 py-1.5 rounded hover:bg-yellow-600">Review</button>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowWelcomePopup(false)}
                  className="w-full py-3 px-4 rounded-lg font-bold text-sm bg-white/5 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
                >
                  Close & Proceed to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
