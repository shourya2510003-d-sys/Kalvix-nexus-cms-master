'use client';

import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { IndianRupee, Search, Filter } from 'lucide-react';

export default function PaymentHistory() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const projectsRef = ref(db, 'client_projects');
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allPayments: any[] = [];
        Object.keys(data).forEach(projectId => {
          const project = data[projectId];
          if (project.payments) {
            Object.keys(project.payments).forEach(paymentId => {
              allPayments.push({
                id: paymentId,
                projectId,
                projectTitle: project.projectTitle || 'Unknown Project',
                companyName: project.companyName || 'Unknown Company',
                ...project.payments[paymentId]
              });
            });
          }
        });
        
        // Sort by date descending
        allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPayments(allPayments);
      } else {
        setPayments([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatINR = (val: any) => {
    if (!val) return '₹0';
    const num = parseInt(val.toString().replace(/\D/g, ''), 10);
    if (isNaN(num)) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  const totalRevenue = payments.reduce((sum, p) => sum + (parseInt((p.amount || '0').toString().replace(/\D/g, ''), 10) || 0), 0);

  const filteredPayments = payments.filter(p => 
    (p.projectTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.mode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.remark && p.remark.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="text-center py-10 text-gold-primary">Loading payment history...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-bg-card border border-gold-primary/20 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-orbitron font-bold text-2xl text-text-primary">Payment History</h2>
          <p className="text-sm text-text-muted mt-1">Global record of all payments received across all client projects.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-rajdhani font-bold">Total Revenue Collected</p>
            <p className="font-orbitron font-bold text-2xl text-emerald-400">{formatINR(totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by project, company, or mode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-surface border border-gold-primary/20 rounded-xl py-3 pl-10 pr-4 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-bg-card border border-gold-primary/10 rounded-xl overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="text-center text-text-muted font-rajdhani py-12">
            No payments match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-bg-surface border-b border-gold-primary/10">
                  <th className="py-4 px-6 text-xs font-rajdhani font-bold uppercase tracking-widest text-text-muted">Date</th>
                  <th className="py-4 px-6 text-xs font-rajdhani font-bold uppercase tracking-widest text-text-muted">Company & Project</th>
                  <th className="py-4 px-6 text-xs font-rajdhani font-bold uppercase tracking-widest text-text-muted">Mode</th>
                  <th className="py-4 px-6 text-xs font-rajdhani font-bold uppercase tracking-widest text-text-muted">Remark</th>
                  <th className="py-4 px-6 text-xs font-rajdhani font-bold uppercase tracking-widest text-text-muted text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="border-b border-gold-primary/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-sm text-text-primary whitespace-nowrap">{p.date}</td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-text-primary">{p.companyName}</p>
                      <p className="text-xs text-text-muted mt-0.5">{p.projectTitle}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-text-primary">
                      <span className="bg-bg-surface px-2 py-1 rounded border border-gold-primary/10 text-xs">{p.mode}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-text-muted max-w-[200px] truncate" title={p.remark}>{p.remark || '-'}</td>
                    <td className="py-4 px-6 text-sm font-orbitron font-bold text-emerald-400 text-right">{formatINR(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
