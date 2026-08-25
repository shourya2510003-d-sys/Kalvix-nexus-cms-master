'use client';

import React, { useState, useEffect } from 'react';
import { ref, onValue, update, push, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Briefcase, Clock, UserCheck, Calendar, DollarSign, Plus, Trash2, IndianRupee } from 'lucide-react';

const TIMELINE_STEPS = [
  'Requirement Approved',
  'Planning',
  'Design',
  'Development',
  'Testing',
  'Deployment',
  'Completed'
];

export default function ClientProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPaymentProjectId, setExpandedPaymentProjectId] = useState<string | null>(null);
  const [newPayment, setNewPayment] = useState({ amount: '', date: '', mode: 'Bank Transfer', remark: '' });

  useEffect(() => {
    const projectsRef = ref(db, 'client_projects');
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProjects(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      } else {
        setProjects([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdate = async (id: string, field: string, value: string) => {
    try {
      await update(ref(db, `client_projects/${id}`), { [field]: value });
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleAddPayment = async (projectId: string) => {
    if (!newPayment.amount || !newPayment.date) return;
    try {
      await push(ref(db, `client_projects/${projectId}/payments`), newPayment);
      setNewPayment({ amount: '', date: '', mode: 'Bank Transfer', remark: '' });
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  const handleDeletePayment = async (projectId: string, paymentId: string) => {
    if (confirm("Are you sure you want to delete this payment record?")) {
      try {
        await remove(ref(db, `client_projects/${projectId}/payments/${paymentId}`));
      } catch (error) {
        console.error("Error deleting payment:", error);
      }
    }
  };

  const formatINR = (val: any) => {
    if (!val) return '₹0';
    const num = parseInt(val.toString().replace(/\D/g, ''), 10);
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  if (loading) return <div className="text-center py-10 text-gold-primary">Loading projects...</div>;

  return (
    <div className="space-y-6">
      {projects.length === 0 ? (
        <div className="bg-bg-surface border border-gold-primary/10 rounded-xl p-10 text-center text-text-muted font-rajdhani">
          No client projects found.
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((proj) => (
            <div key={proj.id} className="bg-bg-card border border-gold-primary/20 rounded-xl p-6 relative">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-gold-primary/10 text-gold-primary px-2 py-0.5 rounded text-xs font-bold">{proj.clientId}</span>
                      <span className="text-text-muted text-xs">{proj.companyName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-orbitron font-bold text-xl text-text-primary">{proj.projectTitle}</h3>
                      <button 
                        onClick={() => setExpandedPaymentProjectId(expandedPaymentProjectId === proj.id ? null : proj.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                          expandedPaymentProjectId === proj.id ? 'bg-gold-primary text-black' : 'bg-bg-surface border border-gold-primary/30 text-gold-primary hover:bg-gold-primary/10'
                        }`}
                      >
                        <IndianRupee size={14} /> Payments
                      </button>
                    </div>
                    <p className="text-sm text-text-muted">{proj.projectCategory}</p>
                  </div>

                  {/* Admin Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-bg-surface p-4 rounded-lg border border-gold-primary/10">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">Assign Manager</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Vikram Singh" 
                        value={proj.assignedManager || ''} 
                        onChange={(e) => handleUpdate(proj.id, 'assignedManager', e.target.value)}
                        className="w-full bg-bg-primary border border-gold-primary/20 rounded px-3 py-1.5 text-xs text-text-primary focus:border-gold-primary outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">Priority</label>
                      <select 
                        value={proj.priority || 'Medium'} 
                        onChange={(e) => handleUpdate(proj.id, 'priority', e.target.value)}
                        className="w-full bg-bg-primary border border-gold-primary/20 rounded px-3 py-1.5 text-xs text-text-primary focus:border-gold-primary outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">Delivery Date</label>
                      <input 
                        type="date" 
                        value={proj.deliveryDate || ''} 
                        onChange={(e) => handleUpdate(proj.id, 'deliveryDate', e.target.value)}
                        className="w-full bg-bg-primary border border-gold-primary/20 rounded px-3 py-1.5 text-xs text-text-primary focus:border-gold-primary outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-text-muted mb-1">Current Status</label>
                      <select 
                        value={proj.status || 'Requirement Approved'} 
                        onChange={(e) => handleUpdate(proj.id, 'status', e.target.value)}
                        className="w-full bg-bg-primary border border-gold-primary/20 rounded px-3 py-1.5 text-xs text-gold-primary font-bold focus:border-gold-primary outline-none"
                      >
                        {TIMELINE_STEPS.map(step => (
                          <option key={step} value={step}>{step}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Visual Timeline */}
                  <div className="pt-4 overflow-x-auto">
                      <div className="flex items-center min-w-max pb-2">
                        {TIMELINE_STEPS.map((step, index) => {
                          const currentIndex = TIMELINE_STEPS.indexOf(proj.status || 'Requirement Approved');
                          const isCompleted = index < currentIndex || proj.status === 'Completed';
                          const isCurrent = index === currentIndex && proj.status !== 'Completed';
                          const isPending = index > currentIndex;

                          return (
                            <React.Fragment key={step}>
                              <div className="flex flex-col items-center relative z-10 w-24">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] transition-colors ${
                                  isCompleted ? 'bg-emerald-500 border-emerald-500 text-bg-primary' : 
                                  isCurrent ? 'bg-bg-card border-gold-primary text-gold-primary animate-pulse' : 
                                  'bg-bg-surface border-border text-text-muted'
                                }`}>
                                  {isCompleted ? '✓' : index + 1}
                                </div>
                                <span className={`text-[10px] mt-2 text-center font-rajdhani uppercase tracking-wider ${
                                  isCurrent ? 'text-gold-primary font-bold' : 'text-text-muted'
                                }`}>{step}</span>
                              </div>
                              {index < TIMELINE_STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 w-12 -ml-2 -mr-2 mb-6 ${
                                  isCompleted ? 'bg-emerald-500' : 'bg-border'
                                }`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      {proj.status !== 'Completed' ? (
                        <button onClick={() => handleUpdate(proj.id, 'status', 'Completed')} className="bg-emerald-500 text-bg-primary font-bold px-6 py-2 rounded-lg text-xs uppercase tracking-widest hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          Mark as Delivered ✓
                        </button>
                      ) : (
                        <div className="text-emerald-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Project Delivered
                        </div>
                      )}
                    </div>
                </div>
                
              </div>
            </div>
          ))}

          {/* Payment Management Modal */}
          {expandedPaymentProjectId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-bg-card border border-gold-primary/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gold-primary/20 flex justify-between items-center bg-bg-surface">
                  <h4 className="font-orbitron font-bold text-lg text-gold-primary uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={20} /> Payment Records
                  </h4>
                  <button onClick={() => setExpandedPaymentProjectId(null)} className="text-text-muted hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 bg-bg-primary">
                  {(() => {
                    const proj = projects.find(p => p.id === expandedPaymentProjectId);
                    if (!proj) return null;

                    return (
                      <>
                        <div className="space-y-3 mb-6">
                          {proj.payments ? Object.entries(proj.payments).map(([pid, pay]: [string, any]) => (
                            <div key={pid} className="flex items-center justify-between bg-bg-surface p-4 rounded-xl border border-white/5">
                              <div>
                                <p className="text-emerald-400 font-bold font-orbitron text-lg">{formatINR(pay.amount)}</p>
                                <div className="text-sm text-text-muted mt-1 flex gap-3 flex-wrap">
                                  <span>{pay.date}</span>
                                  <span className="text-gold-primary/50">•</span>
                                  <span>{pay.mode}</span>
                                  {pay.remark && <><span className="text-gold-primary/50">•</span><span>{pay.remark}</span></>}
                                </div>
                              </div>
                              <button onClick={() => handleDeletePayment(proj.id, pid)} className="text-red-400 hover:text-red-500 p-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )) : (
                            <div className="text-sm text-text-muted italic text-center py-8 bg-bg-surface rounded-xl border border-white/5">No payments recorded for this project yet.</div>
                          )}
                        </div>

                        <div className="bg-bg-surface border border-gold-primary/20 p-5 rounded-xl">
                          <h5 className="font-rajdhani text-sm font-bold uppercase tracking-widest text-text-primary mb-4">Add New Payment</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs uppercase tracking-widest text-text-muted mb-1">Amount (₹)</label>
                              <input type="number" placeholder="e.g. 5000" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} className="w-full bg-bg-primary border border-gold-primary/20 rounded-lg px-4 py-2.5 text-sm focus:border-gold-primary outline-none transition-colors" />
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-widest text-text-muted mb-1">Date</label>
                              <input type="date" value={newPayment.date} onChange={e => setNewPayment({...newPayment, date: e.target.value})} className="w-full bg-bg-primary border border-gold-primary/20 rounded-lg px-4 py-2.5 text-sm focus:border-gold-primary outline-none transition-colors" />
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-widest text-text-muted mb-1">Payment Mode</label>
                              <select value={newPayment.mode} onChange={e => setNewPayment({...newPayment, mode: e.target.value})} className="w-full bg-bg-primary border border-gold-primary/20 rounded-lg px-4 py-2.5 text-sm focus:border-gold-primary outline-none transition-colors">
                                <option>Bank Transfer</option>
                                <option>UPI</option>
                                <option>Cash</option>
                                <option>Credit Card</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs uppercase tracking-widest text-text-muted mb-1">Remark (Optional)</label>
                              <input type="text" placeholder="e.g. Advance Payment" value={newPayment.remark} onChange={e => setNewPayment({...newPayment, remark: e.target.value})} className="w-full bg-bg-primary border border-gold-primary/20 rounded-lg px-4 py-2.5 text-sm focus:border-gold-primary outline-none transition-colors" />
                            </div>
                            <div className="md:col-span-2 mt-2">
                              <button onClick={() => handleAddPayment(proj.id)} className="flex items-center justify-center gap-2 w-full bg-gold-primary text-black hover:bg-gold-light transition-colors px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-widest">
                                <Plus size={18} /> Add Record
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
