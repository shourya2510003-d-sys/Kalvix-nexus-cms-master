'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, Settings, LogOut, Briefcase, FileText, ImageIcon, MessageSquare, Activity, Edit3, Save, Plus, Trash2, CheckCircle, UserCheck
} from 'lucide-react';
import { ref, get, set, update, push, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import dynamic from 'next/dynamic';

const EmployeeModule = dynamic(() => import('@/components/admin/EmployeeModule'), { ssr: false });

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Data States
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [homeContent, setHomeContent] = useState<any>({ heroTitle: '', heroSubtitle: '' });
  const [adminCreds, setAdminCreds] = useState<any>({ username: 'admin', password: 'ram' });

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      router.push('/admin');
    }

    // Listen to Firebase Data
    const loadData = () => {
      onValue(ref(db, '/'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
          if (data.services) setServices(Object.keys(data.services).map(k => ({ id: k, ...data.services[k] })));
          if (data.projects) setProjects(Object.keys(data.projects).map(k => ({ id: k, ...data.projects[k] })));
          if (data.team) setTeam(Object.keys(data.team).map(k => ({ id: k, ...data.team[k] })));
          if (data.pricing) setPricing(Object.keys(data.pricing).map(k => ({ id: k, ...data.pricing[k] })));
          if (data.reviews) setReviews(Object.keys(data.reviews).map(k => ({ id: k, ...data.reviews[k] })));
          if (data.leads) setLeads(Object.keys(data.leads).map(k => ({ id: k, ...data.leads[k] })));
          if (data.home) setHomeContent(data.home);
          if (data.admin) setAdminCreds(data.admin);
        }
      });
    };
    loadData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin');
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
    setIsSaving(true);
    await set(ref(db, 'admin'), adminCreds);
    setIsSaving(false);
    showSaveSuccess();
    alert("Admin credentials updated. Please use these next time.");
  };

  const handleListChange = (list: any[], setList: any, index: number, field: string, value: string) => {
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
    list.forEach(item => {
      const { id, ...data } = item;
      formattedList[id || push(ref(db)).key] = data;
    });
    await set(ref(db, node), formattedList);
    setIsSaving(false);
    showSaveSuccess();
  };

  const addItem = (list: any[], setList: any, template: any) => {
    setList([...list, { id: `new_${Date.now()}`, ...template }]);
  };

  const removeItem = (list: any[], setList: any, index: number) => {
    const newList = [...list];
    newList.splice(index, 1);
    setList(newList);
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
        t1: { name: 'Shourya Sharma', role: 'Founder & CEO', desc: 'Full-Stack Developer, Performance Marketer, and Business Growth Architect.', image: '/founder.jpg', linkedin: 'https://linkedin.com/in/shouryasharma2809', github: 'https://github.com/shourya251003-d-sys' },
        t2: { name: 'Vikram Singh Parmar', role: 'Co-Founder & CTO', desc: 'Systems Architect, Backend Engineer, and Cloud Solutions Expert.', image: '/founder_vikram.jpg', linkedin: 'https://linkedin.com/in/vikram-singh-parmar-24ba3020', github: '' }
      }
    };
    await set(ref(db, '/'), defaultData);
    setIsSaving(false);
    showSaveSuccess();
    alert('Database seeded successfully!');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'home', label: 'Home Page', icon: Edit3 },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: ImageIcon },
    { id: 'team', label: 'Team Profiles', icon: Users },
    { id: 'pricing', label: 'Pricing Plans', icon: FileText },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'leads', label: 'Contact Form Leads', icon: MessageSquare },
    { id: 'employees', label: 'Employees', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-bg-primary min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-card border-r border-gold-primary/10 flex flex-col relative z-20">
        <div className="p-6 border-b border-gold-primary/10">
          <h2 className="font-orbitron font-bold text-lg text-text-primary uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-primary animate-pulse" />
            Kalvix Admin
          </h2>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary/20' 
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-surface'
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

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col h-screen">
        <header className="h-20 border-b border-gold-primary/10 bg-bg-primary/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div>
            <h1 className="font-orbitron font-bold text-xl text-text-primary capitalize tracking-wider">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {saveMessage && (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 animate-fade-in">
                <CheckCircle size={12} /> {saveMessage}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
              <Activity size={12} className="animate-pulse" /> Live DB
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 z-10">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-bg-card border border-gold-primary/10 rounded-xl p-8">
                <h3 className="font-orbitron font-bold text-lg mb-4 text-text-primary">Database Setup</h3>
                <p className="text-text-muted text-sm leading-relaxed mb-6">
                  You are now connected to the Firebase Realtime Database. If your database is empty, click the button below to upload the initial default data to Firebase.
                </p>
                <button 
                  onClick={seedDatabase}
                  disabled={isSaving}
                  className="bg-gold-primary hover:bg-gold-light text-black font-rajdhani font-bold text-sm tracking-widest uppercase px-6 py-2.5 rounded-lg transition-all"
                >
                  Upload Seed Data to Firebase
                </button>
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
                        import('firebase/database').then(({ ref: fRef, remove }) => remove(fRef(db, 'leads')));
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
                            import('firebase/database').then(({ ref: fRef, remove }) => remove(fRef(db, `leads/${lead.id}`)));
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

          {/* DYNAMIC LIST TABS (Services, Projects, Team, Pricing, Reviews) */}
          {['services', 'projects', 'team', 'pricing', 'reviews'].includes(activeTab) && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-orbitron font-bold text-text-primary capitalize">{activeTab} List</h3>
                <button 
                  onClick={() => {
                    let template: any = { title: '', desc: '' };
                    if (activeTab === 'pricing') template = { name: '', price: '', period: '', desc: '', features: '', popular: false, cta: '' };
                    if (activeTab === 'team') template = { name: '', role: '', desc: '', image: '', linkedin: '', github: '' };
                    if (activeTab === 'projects') template = { title: '', category: '', desc: '', image: '', stats: '', link: '' };
                    if (activeTab === 'services') template = { title: '', category: '', desc: '', icon: 'Code', tools: '', rate: '', deliverables: '' };
                    if (activeTab === 'reviews') template = { name: '', role: '', company: '', text: '', rating: '5' };
                    
                    const listMap: any = { services, projects, team, pricing, reviews };
                    const setListMap: any = { services: setServices, projects: setProjects, team: setTeam, pricing: setPricing, reviews: setReviews };
                    addItem(listMap[activeTab], setListMap[activeTab], template);
                  }}
                  className="bg-gold-primary/20 text-gold-primary px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
                >
                  <Plus size={16} /> Add New
                </button>
              </div>

              {(() => {
                const listMap: any = { services, projects, team, pricing, reviews };
                const setListMap: any = { services: setServices, projects: setProjects, team: setTeam, pricing: setPricing, reviews: setReviews };
                const list = listMap[activeTab];
                const setList = setListMap[activeTab];

                return (
                  <div className="space-y-4">
                    {list.map((item: any, i: number) => (
                      <div key={item.id || i} className="bg-bg-card border border-gold-primary/20 p-4 rounded-xl flex gap-4 items-start">
                        <div className="flex-1 space-y-3">
                          {Object.keys(item).map(key => {
                            if (key === 'id') return null;
                            return (
                              <div key={key}>
                                <label className="text-xs font-rajdhani text-text-muted uppercase tracking-widest mb-1 block">{key}</label>
                                {key === 'image' ? (
                                  <div className="flex gap-2 items-center">
                                    {item[key] && <img src={item[key]} alt="Preview" className="w-10 h-10 object-cover rounded" />}
                                    <input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            handleListChange(list, setList, i, key, reader.result as string);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }} 
                                      className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gold-primary/20 file:text-gold-primary hover:file:bg-gold-primary/30" 
                                    />
                                  </div>
                                ) : (
                                  <input 
                                    type="text" 
                                    value={item[key]} 
                                    onChange={(e) => handleListChange(list, setList, i, key, e.target.value)} 
                                    className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary" 
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <button onClick={() => removeItem(list, setList, i)} className="p-2 text-red-400 hover:bg-red-400/10 rounded">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    
                    {list.length > 0 && (
                      <button onClick={() => saveList(activeTab, list)} disabled={isSaving} className="bg-gold-primary text-black px-6 py-2.5 rounded text-sm font-bold flex items-center gap-2 mt-4">
                        <Save size={16} /> Save All {activeTab}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* EMPLOYEES TAB */}
          {activeTab === 'employees' && (
            <div className="animate-fade-in">
              <EmployeeModule />
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-bg-card border border-gold-primary/20 p-6 rounded-xl">
              <h3 className="text-lg font-orbitron font-bold text-text-primary mb-4">Admin Credentials</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-rajdhani text-text-muted uppercase tracking-widest mb-1 block">Username</label>
                  <input type="text" value={adminCreds?.username || ''} onChange={(e) => setAdminCreds({...adminCreds, username: e.target.value})} className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary" />
                </div>
                <div>
                  <label className="text-xs font-rajdhani text-text-muted uppercase tracking-widest mb-1 block">Password</label>
                  <input type="text" value={adminCreds?.password || ''} onChange={(e) => setAdminCreds({...adminCreds, password: e.target.value})} className="w-full bg-bg-surface border border-gold-primary/20 rounded p-2 text-sm text-text-primary" />
                </div>
                <button onClick={saveAdminCreds} disabled={isSaving} className="bg-gold-primary text-black px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                  <Save size={16} /> Update Credentials
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
