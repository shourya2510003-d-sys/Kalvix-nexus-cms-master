'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { Send, Image as ImageIcon, X } from 'lucide-react';

export default function AssignProjectModule() {
  const [employees, setEmployees] = useState<any[]>([]);
  
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const usersRef = ref(db, 'employees');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersObj = snapshot.val();
        const empList = Object.keys(usersObj)
          .map(k => ({ id: k, ...usersObj[k] }));
        setEmployees(empList);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit for Base64 RTDB storage
      alert("Image is too large. Please upload an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const base64 = event.target.result as string;
        const { uploadToCloudinary } = await import('@/lib/cloudinary');
        const url = await uploadToCloudinary(base64);
        if (url) {
          setImage(url);
        } else {
          alert('Failed to upload image. Please try again.');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !message) return;

    setIsSubmitting(true);
    try {
      const projectsRef = ref(db, `assigned_projects/${selectedEmployee}`);
      const newProjectRef = push(projectsRef);
      
      await set(newProjectRef, {
        message,
        image: image || null,
        status: 'pending',
        assignedAt: Date.now()
      });

      alert('Project assigned successfully!');
      setMessage('');
      setImage(null);
      setSelectedEmployee('');
    } catch (err) {
      console.error(err);
      alert('Failed to assign project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl bg-bg-surface border border-gold-primary/20 rounded-xl p-6 animate-fade-in">
      <h3 className="text-xl font-orbitron font-bold text-gold-primary mb-6 flex items-center gap-2">
        <Send size={24} /> Assign Project
      </h3>

      <form onSubmit={handleAssign} className="space-y-6">
        <div>
          <label className="block text-sm text-text-muted mb-2">Select Employee</label>
          <select 
            value={selectedEmployee} 
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded p-3 text-sm focus:border-gold-primary outline-none"
            required
          >
            <option value="">-- Choose an Employee --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name || emp.email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-2">Project Message / Details</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded p-3 text-sm focus:border-gold-primary outline-none h-32"
            placeholder="Describe the project or task..."
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-2">Attach Image (Optional)</label>
          {image ? (
            <div className="relative w-48 h-48 rounded border border-white/10 overflow-hidden bg-black/50 group">
              <img src={image} alt="Preview" className="w-full h-full object-contain" />
              <button 
                type="button" 
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="hidden" 
                id="project-image-upload" 
              />
              <label 
                htmlFor="project-image-upload" 
                className="inline-flex items-center gap-2 bg-black/50 border border-white/10 hover:border-gold-primary/50 text-text-muted px-4 py-3 rounded cursor-pointer transition-colors text-sm"
              >
                <ImageIcon size={18} /> Choose Image
              </label>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || !selectedEmployee || !message}
          className="bg-gold-primary text-black font-bold py-3 px-6 rounded hover:bg-gold-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? 'Assigning...' : 'Assign Project'} <Send size={16} />
        </button>
      </form>
    </div>
  );
}
