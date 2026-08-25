'use client';

import React, { useState, useEffect } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Users, Trash2, Building2, Phone, Mail } from 'lucide-react';

export default function ClientsList() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientsRef = ref(db, 'clients');
    const unsubscribe = onValue(clientsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setClients(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      } else {
        setClients([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      await remove(ref(db, `clients/${id}`));
    }
  };

  if (loading) return <div className="text-center py-10 text-gold-primary">Loading clients...</div>;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-bg-card border border-gold-primary/20 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center">
            <Users size={18} className="text-gold-primary" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted font-rajdhani uppercase tracking-widest">Total Clients</p>
            <p className="font-orbitron font-bold text-xl text-text-primary">{clients.length}</p>
          </div>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="bg-bg-surface border border-gold-primary/10 rounded-xl p-10 text-center text-text-muted font-rajdhani">
          No active clients found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div key={client.id} className="bg-bg-card border border-gold-primary/20 hover:border-gold-primary/50 transition-colors p-6 rounded-xl flex flex-col relative group">
              <button 
                onClick={() => handleDelete(client.id)}
                className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 size={16} />
              </button>

              <div className="mb-4">
                <h3 className="font-orbitron font-bold text-lg text-gold-primary tracking-wide">
                  {client.clientId}
                </h3>
                <span className="text-[10px] uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {client.status || 'Active'}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-start gap-2">
                  <Building2 size={14} className="text-text-muted mt-1 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-text-primary">{client.companyName}</p>
                    <p className="text-xs text-text-muted">{client.ownerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Phone size={14} className="shrink-0" />
                  {client.mobile}
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Mail size={14} className="shrink-0" />
                  {client.email}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gold-primary/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Password</p>
                  <p className="text-xs font-mono text-text-primary bg-bg-surface px-2 py-1 rounded">{client.password}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
