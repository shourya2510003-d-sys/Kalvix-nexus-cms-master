'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { autoMarkSundays, autoMarkAbsents } from '@/lib/attendanceHelpers';
import { Calendar, Save, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export default function AttendanceModule() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>({});
  
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  
  // Manual Attendance State
  const [manualDate, setManualDate] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [manualStatus, setManualStatus] = useState('P');
  const [isSaving, setIsSaving] = useState(false);

  // Photo View Modal State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoData, setPhotoData] = useState<{name: string, date: string, photo: string | null, workDone: string}>({name: '', date: '', photo: null, workDone: ''});

  useEffect(() => {
    // 1. Fetch Employees
    const usersRef = ref(db, 'employees');
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersObj = snapshot.val();
        const empList = Object.keys(usersObj)
          .map(k => ({ id: k, ...usersObj[k] }));
        setEmployees(empList);
      }
    });

    return () => unsubscribeUsers();
  }, []);

  useEffect(() => {
    // Run auto mark logic
    autoMarkSundays(db, selectedMonth);
    autoMarkAbsents(db, selectedMonth);

    // 2. Fetch Attendance for selected month
    const attRef = ref(db, 'attendance');
    const unsubscribeAtt = onValue(attRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Auto-cleanup logic for old proofs (Keep for 1 day)
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - 1);
        
        const thresholdYear = thresholdDate.getFullYear();
        const thresholdMonth = String(thresholdDate.getMonth() + 1).padStart(2, '0');
        const thresholdDay = String(thresholdDate.getDate()).padStart(2, '0');
        const thresholdMonthKey = `${thresholdYear}-${thresholdMonth}`;
        
        Object.keys(data).forEach(empId => {
          Object.keys(data[empId]).forEach(month => {
            Object.keys(data[empId][month]).forEach(day => {
              const record = data[empId][month][day];
              if (record.work_photo || record.work_done) {
                // If it's strictly older than yesterday, delete it
                if (month < thresholdMonthKey || (month === thresholdMonthKey && day < thresholdDay)) {
                  update(ref(db, `attendance/${empId}/${month}/${day}`), {
                    work_photo: null,
                    work_done: null
                  });
                }
              }
            });
          });
        });

        setAttendanceData(data);
      } else {
        setAttendanceData({});
      }
    });

    return () => unsubscribeAtt();
  }, [selectedMonth]);

  const handleManualMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !manualDate || !manualStatus) return;

    setIsSaving(true);
    try {
      const [year, month, day] = manualDate.split('-');
      const monthKey = `${year}-${month}`;
      const dayKey = day;

      const path = `attendance/${selectedEmployee}/${monthKey}/${dayKey}`;
      await update(ref(db), {
        [path]: {
          status: manualStatus,
          note: 'Manually marked by admin',
          timestamp: Date.now()
        }
      });
      alert('Attendance marked successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to mark attendance.');
    } finally {
      setIsSaving(false);
    }
  };

  const getDaysInMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  const daysCount = getDaysInMonth(selectedMonth);
  const daysArray = Array.from({ length: daysCount }, (_, i) => String(i + 1).padStart(2, '0'));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'P': return 'bg-green-600 text-white border-green-700 shadow-sm';
      case 'A': return 'bg-red-600 text-white border-red-700 shadow-sm';
      case 'HP': return 'bg-yellow-500 text-black border-yellow-600 shadow-sm';
      case 'S': return 'bg-blue-600 text-white border-blue-700 shadow-sm';
      default: return 'bg-gray-200 border-gray-300';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* MANUAL ATTENDANCE SECTION */}
      <div className="bg-bg-surface border border-gold-primary/20 rounded-xl p-6">
        <h3 className="text-xl font-orbitron font-bold text-gold-primary mb-6 flex items-center gap-2">
          <Calendar size={24} /> Manual Attendance
        </h3>
        <form onSubmit={handleManualMark} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs text-text-muted mb-1">Employee</label>
            <select 
              value={selectedEmployee} 
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm focus:border-gold-primary outline-none"
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name || emp.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Date</label>
            <input 
              type="date" 
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm focus:border-gold-primary outline-none [color-scheme:dark]"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Status</label>
            <select 
              value={manualStatus} 
              onChange={(e) => setManualStatus(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm focus:border-gold-primary outline-none"
            >
              <option value="P">Present (P)</option>
              <option value="A">Absent (A)</option>
              <option value="HP">Half Present (HP)</option>
              <option value="S">Sunday (S)</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-gold-primary text-black font-bold py-2 px-4 rounded hover:bg-gold-secondary transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Mark Attendance'}
          </button>
        </form>
      </div>

      {/* ATTENDANCE HISTORY CHART */}
      <div className="bg-bg-card border border-gold-primary/20 rounded-2xl p-6 md:p-8 shadow-md hover:shadow-lg transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h3 className="text-2xl font-orbitron font-bold text-text-primary flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-gold-primary/10 flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-gold-primary animate-pulse"></span>
            </span>
            Attendance Overview
          </h3>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gold-primary" />
            <input 
              type="month" 
              min="2026-06"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-bg-surface border border-gold-primary/30 rounded-lg py-2.5 px-4 text-sm font-bold focus:border-gold-primary outline-none shadow-sm cursor-pointer hover:border-gold-primary/60 transition-colors text-text-primary"
            />
          </div>
        </div>

        <div className="min-w-[800px] overflow-x-auto pb-4">
          <div className="flex mb-4 px-4 bg-bg-surface py-3 rounded-lg border border-black/5">
            <div className="w-48 shrink-0 font-bold text-xs text-text-muted tracking-widest uppercase">Employee Profile</div>
            <div className="flex-1 flex gap-1">
              {daysArray.map(day => (
                <div key={day} className="flex-1 text-center font-rajdhani font-bold text-[11px] text-text-muted">
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {employees.map(emp => {
              const empMonthData = attendanceData[emp.id]?.[selectedMonth] || {};
              
              return (
                <div key={emp.id} className="flex items-center group hover:bg-gold-primary/5 p-4 rounded-xl transition-colors border border-transparent hover:border-gold-primary/20">
                  <div className="w-48 shrink-0 flex items-center gap-3 pr-4">
                    <div className="w-8 h-8 rounded-full bg-gold-primary/20 flex items-center justify-center text-gold-primary font-bold text-xs shrink-0 border border-gold-primary/30">
                      {emp.name ? emp.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="text-sm font-bold truncate text-text-secondary group-hover:text-gold-primary transition-colors">
                      {emp.name || emp.email}
                    </div>
                  </div>
                  <div className="flex-1 flex gap-1.5">
                    {daysArray.map(day => {
                      const status = empMonthData[day]?.status || '-';
                      return (
                        <div 
                          key={day} 
                          onClick={() => {
                            if (empMonthData[day]?.work_photo || empMonthData[day]?.work_done) {
                              setPhotoData({
                                name: emp.name || emp.email,
                                date: `${day}/${selectedMonth}`,
                                photo: empMonthData[day].work_photo || null,
                                workDone: empMonthData[day].work_done || 'No work description provided.'
                              });
                              setShowPhotoModal(true);
                            }
                          }}
                          title={`${emp.name || emp.email} - ${day}/${selectedMonth}: ${status}`}
                          className={`flex-1 h-9 rounded-md border flex items-center justify-center text-[11px] font-bold ${empMonthData[day]?.work_done ? 'cursor-pointer ring-1 ring-gold-primary ring-offset-1 ring-offset-bg-card' : 'cursor-help'} hover:scale-110 hover:-translate-y-1 transition-all ${getStatusColor(status)}`}
                        >
                          {status !== '-' ? status : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {employees.length === 0 && (
              <div className="text-center py-12 bg-bg-surface/50 rounded-xl border border-dashed border-black/10">
                <p className="text-text-muted font-rajdhani">No employee records found for this period.</p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-black/5 text-sm font-rajdhani font-bold text-text-secondary justify-center bg-bg-surface/30 p-4 rounded-xl">
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-green-600 border border-green-700 shadow-sm block"></span> P - Present</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-red-600 border border-red-700 shadow-sm block"></span> A - Absent</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-yellow-500 border border-yellow-600 shadow-sm block"></span> HP - Half Present</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-blue-600 border border-blue-700 shadow-sm block"></span> S - Sunday</div>
        </div>
      </div>
      
      {/* Photo View Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-gold-primary/20 p-6 rounded-xl max-w-lg w-full relative shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            <button onClick={() => setShowPhotoModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-red-400 transition-colors">
              <XCircle size={24} />
            </button>
            <h3 className="font-orbitron font-bold text-lg text-gold-primary mb-1">Work Proof</h3>
            <p className="text-xs text-text-muted font-rajdhani uppercase tracking-widest mb-6">{photoData.name} • {photoData.date}</p>
            
            <div className="mb-4">
              <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Work Description</label>
              <div className="p-3 bg-bg-surface border border-gold-primary/10 rounded-lg text-sm text-text-primary min-h-[60px]">
                {photoData.workDone}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Uploaded Photo</label>
              {photoData.photo ? (
                <img src={photoData.photo} alt="Work Proof" className="w-full h-auto max-h-[300px] object-contain rounded-lg border border-gold-primary/30 shadow-inner" />
              ) : (
                <div className="p-6 bg-bg-surface border border-dashed border-gold-primary/20 rounded-lg text-center text-sm text-text-muted italic">
                  No photo was uploaded for this day (or it was auto-deleted).
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
