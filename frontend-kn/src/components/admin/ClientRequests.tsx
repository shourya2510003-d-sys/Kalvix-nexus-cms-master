'use client';

import React, { useState, useEffect } from 'react';
import { ref, onValue, remove, set, get, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Check, X, Building2, Phone, Mail, FileText, Briefcase, Calendar } from 'lucide-react';

export default function ClientRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    const requestsRef = ref(db, 'client_requests');
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRequests(Object.keys(data).map(k => ({ id: k, ...data[k] })));
      } else {
        setRequests([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (request: any) => {
    setApprovingId(request.id);
    try {
      // 1. Generate ID (KNXCLI00X)
      const clientsRef = ref(db, 'clients');
      const snapshot = await get(clientsRef);
      let nextNum = 1;
      if (snapshot.exists()) {
        const existingClients = Object.values(snapshot.val()) as any[];
        const nums = existingClients.map(c => {
          const match = c.clientId?.match(/KNXCLI(\d+)/);
          return match ? parseInt(match[1]) : 0;
        });
        nextNum = Math.max(0, ...nums) + 1;
      }
      const clientId = `KNXCLI${nextNum.toString().padStart(3, '0')}`;
      const password = request.password; // Use client's own password

      // 2. Save to clients node
      const newClientData = {
        ...request,
        clientId,
        status: 'Active',
        approvedAt: new Date().toISOString(),
      };
      
      // Remove id from payload before saving
      const { id, ...dataToSave } = newClientData;
      await set(ref(db, `clients/${clientId}`), dataToSave);

      // 3. Create a project record in client_projects
      const projectRef = ref(db, `client_projects/${clientId}_P1`);
      await set(projectRef, {
        clientId,
        companyName: request.companyName,
        projectTitle: request.projectTitle,
        projectCategory: request.projectCategory,
        projectDescription: request.projectDescription,
        estimatedBudget: request.estimatedBudget,
        expectedCompletion: request.expectedCompletion,
        status: 'Requirement Approved', // Initial status
        createdAt: new Date().toISOString()
      });

      // 4. Delete from client_requests
      await remove(ref(db, `client_requests/${request.id}`));

      // 5. Open WhatsApp Link
      const message = `Hello ${request.ownerName},%0A%0AWelcome to Kalvix Nexus.%0A%0AYour registration has been approved.%0A%0AClient ID: ${clientId}%0APassword: ${password}%0A%0ALogin Here: https://kalvixnexus.com/%0A%0AThank you.`;
      const whatsappUrl = `https://wa.me/${request.whatsapp}?text=${message}`;
      window.open(whatsappUrl, '_blank');

    } catch (error) {
      console.error("Error approving client:", error);
      alert("Failed to approve client.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (confirm("Are you sure you want to reject and delete this request permanently?")) {
      await remove(ref(db, `client_requests/${id}`));
    }
  };

  if (loading) return <div className="text-center py-10 text-gold-primary">Loading requests...</div>;

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="bg-bg-surface border border-gold-primary/10 rounded-xl p-10 text-center text-text-muted font-rajdhani">
          No pending client requests.
        </div>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="bg-bg-card border border-gold-primary/20 rounded-xl p-6 relative">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              
              {/* Info section */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-gold-primary mb-1">
                    <Building2 size={16} /> <span className="font-orbitron font-bold text-sm">Company</span>
                  </div>
                  <p className="text-text-primary text-sm font-bold">{req.companyName}</p>
                  <p className="text-text-muted text-xs">Owner: {req.ownerName}</p>
                  <p className="text-text-muted text-xs">GST: {req.gstNumber || 'N/A'}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-gold-primary mb-1">
                    <Phone size={16} /> <span className="font-orbitron font-bold text-sm">Contact</span>
                  </div>
                  <p className="text-text-primary text-xs flex items-center gap-2"><Phone size={12}/> {req.mobile}</p>
                  <p className="text-text-primary text-xs flex items-center gap-2 text-emerald-400"><Phone size={12}/> {req.whatsapp} (WA)</p>
                  <p className="text-text-primary text-xs flex items-center gap-2"><Mail size={12}/> {req.email}</p>
                </div>

                <div className="md:col-span-2 bg-bg-surface p-4 rounded-lg border border-gold-primary/10 mt-2">
                  <div className="flex items-center gap-2 text-gold-primary mb-2">
                    <Briefcase size={16} /> <span className="font-orbitron font-bold text-sm">Project Details</span>
                  </div>
                  <p className="text-text-primary font-bold text-sm mb-1">{req.projectTitle} <span className="text-xs font-normal text-text-muted bg-bg-primary px-2 py-0.5 rounded ml-2 border border-gold-primary/10">{req.projectCategory}</span></p>
                  <p className="text-text-muted text-xs leading-relaxed mb-3">{req.projectDescription}</p>
                  <div className="flex gap-4 text-xs">
                    <span className="text-gold-primary bg-gold-primary/10 px-2 py-1 rounded">Budget: {req.estimatedBudget}</span>
                    <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Deadline: {req.expectedCompletion}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col gap-3 justify-center items-end border-t lg:border-t-0 lg:border-l border-gold-primary/10 pt-4 lg:pt-0 lg:pl-6 min-w-[120px]">
                <button 
                  onClick={() => handleApprove(req)}
                  disabled={approvingId === req.id}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-colors px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  <Check size={16} /> {approvingId === req.id ? '...' : 'Approve'}
                </button>
                <button 
                  onClick={() => handleReject(req.id)}
                  disabled={approvingId === req.id}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  <X size={16} /> Reject
                </button>
              </div>

            </div>
          </div>
        ))
      )}
    </div>
  );
}
