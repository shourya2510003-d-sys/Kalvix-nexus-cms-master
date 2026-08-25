'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, update, get } from 'firebase/database';
import { CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';

export default function ApproveProjectsModule() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<any>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch users for mapping IDs to Names
    const usersRef = ref(db, 'employees');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        setUsersMap(snapshot.val());
      }
    });

    // Fetch all assigned projects
    const projectsRef = ref(db, 'assigned_projects');
    const unsubscribeProjects = onValue(projectsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let pendingList: any[] = [];
        
        // data is grouped by employeeId -> projectId
        Object.keys(data).forEach(empId => {
          const empProjects = data[empId];
          Object.keys(empProjects).forEach(projId => {
            const project = empProjects[projId];
            if (project.status === 'submitted_full' || project.status === 'submitted_half') {
              pendingList.push({
                empId,
                projId,
                ...project
              });
            }
          });
        });

        // Sort oldest first
        pendingList.sort((a, b) => (a.assignedAt || 0) - (b.assignedAt || 0));
        setSubmissions(pendingList);
      } else {
        setSubmissions([]);
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeProjects();
    };
  }, []);

  const handleAction = async (submission: any, action: 'approve' | 'reject') => {
    setProcessingId(submission.projId);
    try {
      const today = new Date();
      const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const dayKey = String(today.getDate()).padStart(2, '0');
      
      const attendancePath = `attendance/${submission.empId}/${monthKey}/${dayKey}`;
      const projectPath = `assigned_projects/${submission.empId}/${submission.projId}/status`;
      
      const updates: any = {};
      
      if (action === 'approve') {
        updates[projectPath] = 'approved';
        updates[`assigned_projects/${submission.empId}/${submission.projId}/proofImages`] = null; // Delete images to save space
        updates[attendancePath] = {
          status: submission.status === 'submitted_full' ? 'P' : 'HP',
          note: `Approved project: ${submission.message.substring(0, 20)}...`,
          timestamp: Date.now()
        };
      } else {
        updates[projectPath] = 'rejected';
        updates[`assigned_projects/${submission.empId}/${submission.projId}/proofImages`] = null; // Delete images to save space
        updates[attendancePath] = {
          status: 'HP',
          note: `Rejected project: ${submission.message.substring(0, 20)}...`,
          timestamp: Date.now()
        };
        // Optional: create a notification node here for the employee
        const notificationPath = `notifications/${submission.empId}/${Date.now()}`;
        updates[notificationPath] = {
          message: `Your project submission was rejected. Half Present marked.`,
          projectId: submission.projId,
          read: false,
          createdAt: Date.now()
        };
      }

      await update(ref(db), updates);
      alert(`Project ${action}d successfully! Attendance marked.`);
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} project.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="text-xl font-orbitron font-bold text-gold-primary flex items-center gap-2">
          <CheckCircle size={24} /> Approve Project Submissions
        </h3>
        <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold">
          {submissions.length} Pending
        </span>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 text-text-muted bg-bg-surface border border-white/10 rounded-xl">
          No pending project submissions to approve.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {submissions.map(sub => (
            <div key={sub.projId} className="bg-bg-surface border border-white/10 rounded-xl p-6">
              
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                <div>
                  <h4 className="font-bold text-lg text-white">
                    {usersMap[sub.empId]?.name || usersMap[sub.empId]?.email || 'Unknown Employee'}
                  </h4>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${sub.status === 'submitted_full' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {sub.status === 'submitted_full' ? 'Full Completion Request' : 'Half Completion Request'}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(sub, 'reject')}
                    disabled={processingId === sub.projId}
                    className="flex items-center gap-1 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} /> Reject (Marks HP)
                  </button>
                  <button
                    onClick={() => handleAction(sub, 'approve')}
                    disabled={processingId === sub.projId}
                    className="flex items-center gap-1 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white px-4 py-2 rounded text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={16} /> Approve (Marks {sub.status === 'submitted_full' ? 'P' : 'HP'})
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-text-muted"><strong>Original Task:</strong> {sub.message}</p>
                {sub.image && (
                  <img src={sub.image} alt="Task" className="mt-2 h-20 rounded border border-white/10" />
                )}
              </div>

              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <ImageIcon size={16} className="text-gold-primary" /> Submitted Proof Images
                </p>
                
                {sub.proofImages && sub.proofImages.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {sub.proofImages.map((imgStr: string, idx: number) => (
                      <a href={imgStr} target="_blank" rel="noreferrer" key={idx}>
                        <img 
                          src={imgStr} 
                          alt={`Proof ${idx + 1}`} 
                          className="w-32 h-32 object-cover rounded border border-white/20 hover:border-gold-primary cursor-pointer transition-colors" 
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-red-400">No proof images provided.</p>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
