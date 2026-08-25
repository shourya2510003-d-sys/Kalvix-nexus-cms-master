'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Loader2, Download, Search, Users } from 'lucide-react';
import EmployeeIdCard from '@/components/EmployeeIdCard';
import * as htmlToImage from 'html-to-image';

export default function IdCardsModule() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create refs for each card container so we can download them individually
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const snapshot = await get(ref(db, 'employees'));
      if (snapshot.exists()) {
        const emps = Object.values(snapshot.val());
        setEmployees(emps);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (employeeId: string, employeeName: string) => {
    const node = cardRefs.current[employeeId];
    if (!node) return;

    try {
      // Find the inner 3d container to avoid capturing the flip button
      const cardElement = node.querySelector('.group > div') as HTMLElement;
      if (!cardElement || cardElement.children.length < 2) return;
      
      const frontElement = cardElement.children[0] as HTMLElement;
      const backElement = cardElement.children[1] as HTMLElement;

      // Temporarily remove rotation from back so it's not mirrored
      backElement.classList.remove('[transform:rotateY(180deg)]');

      const frontDataUrl = await htmlToImage.toPng(frontElement, {
        quality: 1.0,
        pixelRatio: 2,
        style: { margin: '0' }
      });
      
      const backDataUrl = await htmlToImage.toPng(backElement, {
        quality: 1.0,
        pixelRatio: 2,
        style: { margin: '0' }
      });

      // Restore rotation
      backElement.classList.add('[transform:rotateY(180deg)]');
      
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      
      // Card width and height (340x520)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [340, 520]
      });

      pdf.addImage(frontDataUrl, 'PNG', 0, 0, 340, 520);
      pdf.addPage();
      pdf.addImage(backDataUrl, 'PNG', 0, 0, 340, 520);

      pdf.save(`Kalvix_Nexus_ID_${employeeName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to download ID card PDF', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-orbitron font-bold text-text-primary flex items-center gap-2">
            <Users className="text-gold-primary" /> ID Cards Directory
          </h2>
          <p className="text-sm text-text-muted mt-1">Bulk view and download employee ID cards.</p>
        </div>
        
        <div className="flex bg-bg-surface border border-gold-primary/20 rounded-lg px-3 py-2 w-full sm:w-64 focus-within:border-gold-primary/50 transition-colors">
          <Search size={18} className="text-text-muted mr-2" />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-text-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gold-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredEmployees.map((emp) => (
            <div key={emp.employee_id} className="flex flex-col items-center bg-bg-surface/30 p-6 rounded-2xl border border-white/5">
              
              {/* Card Container */}
              <div 
                ref={(el) => { cardRefs.current[emp.employee_id] = el; }} 
                className="w-full flex justify-center mb-6"
              >
                <EmployeeIdCard employee={emp} />
              </div>
              
              {/* Download Action */}
              <button
                onClick={() => handleDownload(emp.employee_id, emp.name)}
                className="w-full bg-gold-primary/10 hover:bg-gold-primary/20 text-gold-primary border border-gold-primary/30 py-3 rounded-xl font-rajdhani font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={16} /> Download ID Card
              </button>
            </div>
          ))}
          
          {filteredEmployees.length === 0 && (
            <div className="col-span-full text-center py-12 text-text-muted border border-dashed border-white/10 rounded-2xl">
              No employees found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
