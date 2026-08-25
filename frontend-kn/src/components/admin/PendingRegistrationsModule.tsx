'use client';

import React, { useState } from 'react';
import { ref, remove, push } from 'firebase/database';
import { db } from '@/lib/firebase';
import { User, CheckCircle, XCircle, Phone, Mail, Building2, UserPlus, MapPin, Calendar, Loader2, X } from 'lucide-react';
import { deleteImageFromCloudinary } from '@/actions/cloudinary';

interface PendingEmployee {
  id: string;
  name: string;
  address: string;
  age: string;
  mobile: string;
  email: string;
  designation?: string;
  department: string;
  project?: string;
  joining_date: string;
  profile_photo?: string;
  submitted_at: string;
}

export default function PendingRegistrationsModule({ pendingRegistrations }: { pendingRegistrations: PendingEmployee[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approvingEmployee, setApprovingEmployee] = useState<PendingEmployee | null>(null);
  const [approvalForm, setApprovalForm] = useState({ employeeId: '', designation: '', project: '' });

  const submitApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingEmployee) return;
    setProcessingId(approvingEmployee.id);
    
    try {
      const newEmployee = {
        employee_id: approvalForm.employeeId || `KNX${Math.floor(Math.random() * 10000)}`,
        name: approvingEmployee.name,
        address: approvingEmployee.address,
        age: approvingEmployee.age,
        mobile: approvingEmployee.mobile,
        email: approvingEmployee.email,
        designation: approvalForm.designation,
        department: approvingEmployee.department,
        project: approvalForm.project,
        joining_date: approvingEmployee.joining_date,
        profile_photo: approvingEmployee.profile_photo || '',
        status: 'Active',
        password: 'kalvixnexus',
      };

      await push(ref(db, 'employees'), newEmployee);
      await remove(ref(db, `pending_employees/${approvingEmployee.id}`));
      
      setApprovingEmployee(null);
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Approval failed. See console.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Are you sure you want to reject and delete this application?")) return;
    setProcessingId(id);
    try {
      const reg = pendingRegistrations.find(r => r.id === id);
      if (reg && reg.profile_photo) {
        await deleteImageFromCloudinary(reg.profile_photo).catch(err => console.error("Cloudinary deletion failed:", err));
      }
      await remove(ref(db, `pending_employees/${id}`));
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  if (pendingRegistrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <UserPlus size={64} className="mb-4 text-gold-primary" />
        <h3 className="text-xl font-orbitron font-bold text-text-primary">No Pending Registrations</h3>
        <p className="text-sm font-rajdhani text-text-muted mt-2">When someone applies via the registration form, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pendingRegistrations.sort((a,b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()).map(emp => (
          <div key={emp.id} className="bg-bg-card border border-gold-primary/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 flex gap-2">
              <button 
                onClick={() => {
                  setApprovingEmployee(emp);
                  setApprovalForm({ employeeId: '', designation: '', project: '' });
                }}
                disabled={processingId === emp.id}
                className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-colors"
                title="Approve"
              >
                <CheckCircle size={16} />
              </button>
              <button 
                onClick={() => handleReject(emp.id)}
                disabled={processingId === emp.id}
                className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-black transition-colors"
                title="Reject"
              >
                {processingId === emp.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              {emp.profile_photo ? (
                <img src={emp.profile_photo} alt={emp.name} className="w-16 h-16 rounded-full object-cover border-2 border-gold-primary/30" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-bg-surface border-2 border-gold-primary/30 flex items-center justify-center text-gold-primary font-bold text-xl">
                  {emp.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-orbitron font-bold text-lg text-text-primary">{emp.name}</h3>
                <span className="text-[10px] text-text-muted mt-1 inline-block">Applied: {new Date(emp.submitted_at).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2 mt-4 text-xs font-rajdhani bg-bg-surface border border-gold-primary/10 rounded-xl p-4">
              <p className="flex items-center gap-2"><Mail size={14} className="text-gold-primary" /> <span className="text-text-primary font-mono">{emp.email}</span></p>
              <p className="flex items-center gap-2"><Phone size={14} className="text-gold-primary" /> <span className="text-text-primary">{emp.mobile}</span></p>
              <p className="flex items-center gap-2"><Building2 size={14} className="text-gold-primary" /> <span className="text-text-primary">{emp.department}</span></p>
              <p className="flex items-center gap-2"><MapPin size={14} className="text-gold-primary" /> <span className="text-text-primary">{emp.address}</span></p>
              <p className="flex items-center gap-2"><Calendar size={14} className="text-gold-primary" /> <span className="text-text-primary">Prefers: {emp.joining_date}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Modal */}
      {approvingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-bg-card border border-gold-primary/30 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-orbitron font-bold text-text-primary">Approve Application</h3>
              <button onClick={() => setApprovingEmployee(null)} className="text-text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={submitApproval} className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-text-muted mb-2">You are approving <span className="text-gold-primary font-bold">{approvingEmployee.name}</span>.</p>
                <p className="text-xs text-text-muted">Please assign their Employee ID, designation, and project before finalizing.</p>
              </div>

              <div>
                <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Employee ID *</label>
                <input
                  type="text"
                  required
                  value={approvalForm.employeeId}
                  onChange={e => setApprovalForm(f => ({ ...f, employeeId: e.target.value }))}
                  className="w-full bg-bg-surface border border-gold-primary/10 rounded-lg py-2.5 px-3 text-sm text-text-primary focus:border-gold-primary/50 focus:outline-none transition-colors"
                  placeholder="e.g. KNX001"
                />
              </div>

              <div>
                <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Designation *</label>
                <input
                  type="text"
                  required
                  value={approvalForm.designation}
                  onChange={e => setApprovalForm(f => ({ ...f, designation: e.target.value }))}
                  className="w-full bg-bg-surface border border-gold-primary/10 rounded-lg py-2.5 px-3 text-sm text-text-primary focus:border-gold-primary/50 focus:outline-none transition-colors"
                  placeholder="e.g. Frontend Developer"
                />
              </div>

              <div>
                <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Project (Optional)</label>
                <input
                  type="text"
                  value={approvalForm.project}
                  onChange={e => setApprovalForm(f => ({ ...f, project: e.target.value }))}
                  className="w-full bg-bg-surface border border-gold-primary/10 rounded-lg py-2.5 px-3 text-sm text-text-primary focus:border-gold-primary/50 focus:outline-none transition-colors"
                  placeholder="e.g. Nexus Core"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setApprovingEmployee(null)} className="flex-1 border border-gold-primary/20 text-text-muted hover:text-text-primary py-2.5 rounded-lg text-sm font-bold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={processingId !== null} className="flex-1 bg-gold-primary text-black py-2.5 rounded-lg text-sm font-bold hover:bg-gold-light transition-colors flex items-center justify-center">
                  {processingId ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
