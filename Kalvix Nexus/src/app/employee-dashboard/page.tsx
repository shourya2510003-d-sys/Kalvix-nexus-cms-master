'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, get, set, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { User, LogOut, KeyRound, ShieldCheck, Mail, Phone, Briefcase, Calendar, Award, Loader2, Send, Clock, AlertCircle, RefreshCw, Sun, Moon, CheckCircle, ChevronLeft, ChevronRight, Menu, X, Download } from 'lucide-react';
import { push } from 'firebase/database';
import EmployeeIdCard from '@/components/EmployeeIdCard';
import * as htmlToImage from 'html-to-image';
import { getCertificateAssets, generateCertificatePDF } from '@/lib/pdfUtils';
import { autoMarkAbsents, autoMarkSundays } from '@/lib/attendanceHelpers';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTabState] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tabHistory, setTabHistory] = useState<string[]>(['overview']);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const setActiveTab = (newTab: string) => {
    if (newTab === activeTab) return;
    const newHistory = tabHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(newTab);
    setTabHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    setActiveTabState(newTab);
    setIsMobileMenuOpen(false); // Close menu when tab changes
  };

  const handleBack = () => {
    if (currentHistoryIndex > 0) {
      const prevIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(prevIndex);
      setActiveTabState(tabHistory[prevIndex]);
    }
  };

  const handleForward = () => {
    if (currentHistoryIndex < tabHistory.length - 1) {
      const nextIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(nextIndex);
      setActiveTabState(tabHistory[nextIndex]);
    }
  };
  const [theme, setTheme] = useState('light');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });

  // Cert request state
  const [reqTitle, setReqTitle] = useState('');
  const [reqType, setReqType] = useState('Achievement');
  const [reqReason, setReqReason] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [reqMessage, setReqMessage] = useState('');

  // Projects state
  const [projects, setProjects] = useState<any[]>([]);
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const pendingProjectsCount = projects.filter(p => p.status === 'pending').length;
  
  // Attendance state
  const [attendanceHistory, setAttendanceHistory] = useState<any>({});
  
  const today = new Date();
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  
  // Image upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProjectId, setUploadProjectId] = useState<string | null>(null);
  const [uploadAction, setUploadAction] = useState<'submitted_full' | 'submitted_half' | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Mark Attendance Modal state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [workDone, setWorkDone] = useState('');
  const [workPhoto, setWorkPhoto] = useState<string | null>(null);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState({ type: '', text: '' });
  
  // Photo View Modal State (for viewing past attendance)
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoData, setPhotoData] = useState<{date: string, photo: string | null, workDone: string}>({date: '', photo: null, workDone: ''});

  const handleWorkPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setAttendanceMessage({ type: 'error', text: 'Photo must be less than 2MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const { uploadToCloudinary } = await import('@/lib/cloudinary');
        const url = await uploadToCloudinary(base64);
        if (url) {
          setWorkPhoto(url);
        } else {
          setAttendanceMessage({ type: 'error', text: 'Failed to upload photo.' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDone || !workPhoto) {
      setAttendanceMessage({ type: 'error', text: 'Work description and photo are mandatory.' });
      return;
    }
    setIsSubmittingAttendance(true);
    setAttendanceMessage({ type: '', text: '' });
    try {
      const d = new Date();
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const dayKey = String(d.getDate()).padStart(2, '0');
      const attendanceRef = ref(db, `attendance/${employeeId}/${monthKey}/${dayKey}`);
      
      const snapshot = await get(attendanceRef);
      if (snapshot.exists() && (snapshot.val().status === 'Present' || snapshot.val().status === 'P' || snapshot.val().status === 'HP')) {
        setAttendanceMessage({ type: 'error', text: 'You have already marked attendance for today.' });
        setIsSubmittingAttendance(false);
        return;
      }

      let finalPhotoUrl = workPhoto;
      if (workPhoto.startsWith('data:image')) {
        const { uploadToCloudinary } = await import('@/lib/cloudinary');
        const url = await uploadToCloudinary(workPhoto);
        if (!url) {
           setAttendanceMessage({ type: 'error', text: 'Failed to upload photo to Cloudinary.' });
           setIsSubmittingAttendance(false);
           return;
        }
        finalPhotoUrl = url;
      }
      
      await set(attendanceRef, {
        status: 'P',
        work_done: workDone,
        work_photo: finalPhotoUrl,
        timestamp: new Date().toISOString()
      });
      setAttendanceMessage({ type: 'success', text: 'Attendance marked successfully!' });
      setTimeout(() => {
        setShowAttendanceModal(false);
        setWorkDone('');
        setWorkPhoto(null);
        setRefreshTrigger(prev => prev + 1);
      }, 1500);
    } catch (err) {
      setAttendanceMessage({ type: 'error', text: 'Failed to mark attendance. Try again.' });
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  const handleAction = async (cert: any, type: 'view' | 'download') => {
    const actionKey = cert.id + '-' + type;
    setActiveActionId(actionKey);
    try {
      const assets = await getCertificateAssets();
      const certEmp = {
        name: employee.name,
        employee_id: employee.employee_id,
        designation: employee.designation,
        department: employee.department,
        project: employee.project,
        joining_date: employee.joining_date
      };
      
      const pdfDataUrl = await generateCertificatePDF(
        certEmp,
        cert.certificate_id,
        cert.certificate_title,
        cert.certificate_type,
        cert.issue_date,
        cert.issued_by,
        cert.qr_code,
        assets.logoDataUrl,
        assets.stampDataUrl,
        assets.ceoSignatureDataUrl,
        assets.ctoSignatureDataUrl,
        assets.ceoName,
        assets.ceoRole,
        assets.ctoName,
        assets.ctoRole
      );

      if (type === 'view') {
        const base64 = pdfDataUrl.split(',')[1];
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = pdfDataUrl;
        link.download = `${cert.certificate_id}-${employee.name.replace(/\s+/g, '_')}.pdf`;
        link.click();
      }
    } catch (err) {
      console.error('Failed to regenerate PDF on employee side', err);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDownloadIdCard = async () => {
    const node = document.getElementById('employee-id-card-render');
    if (!node) return;

    try {
      const cardElement = node.querySelector('.group > div') as HTMLElement || node;
      const dataUrl = await htmlToImage.toPng(cardElement, {
        quality: 1.0,
        pixelRatio: 2,
        style: {
          transform: 'none',
          margin: '0',
        }
      });
      const link = document.createElement('a');
      link.download = `Kalvix_Nexus_ID_${employee.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download ID card', err);
      alert('Failed to generate image. Please try again.');
    }
  };

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light';
    setTheme(t);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  useEffect(() => {
    const session = localStorage.getItem('employeeSession');
    if (!session) {
      router.push('/');
      return;
    }

    const fetchAttendance = async () => {
      try {
        await autoMarkSundays(db, selectedAttendanceMonth);
        await autoMarkAbsents(db, selectedAttendanceMonth);
        
        const attRef = ref(db, `attendance/${session}/${selectedAttendanceMonth}`);
        const attSnap = await get(attRef);
        if (attSnap.exists()) {
          const data = attSnap.val();
          
          // Auto-cleanup logic for old proofs (Keep for 1 day)
          const thresholdDate = new Date();
          thresholdDate.setDate(thresholdDate.getDate() - 1);
          const thresholdDay = String(thresholdDate.getDate()).padStart(2, '0');
          const currentMonthKey = `${thresholdDate.getFullYear()}-${String(thresholdDate.getMonth() + 1).padStart(2, '0')}`;
          
          Object.keys(data).forEach(day => {
            const record = data[day];
            if (record.work_photo || record.work_done) {
              if (selectedAttendanceMonth < currentMonthKey || (selectedAttendanceMonth === currentMonthKey && day < thresholdDay)) {
                import('firebase/database').then(({ update }) => {
                  update(ref(db, `attendance/${session}/${selectedAttendanceMonth}/${day}`), {
                    work_photo: null,
                    work_done: null
                  });
                });
                delete data[day].work_photo;
                delete data[day].work_done;
              }
            }
          });

          setAttendanceHistory(data);
        } else {
          setAttendanceHistory({});
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };

    if (activeTab === 'attendance') {
      fetchAttendance();
    }
  }, [selectedAttendanceMonth, activeTab, refreshTrigger, router]);

  useEffect(() => {
    const session = localStorage.getItem('employeeSession');
    setEmployeeId(session);

    const loadData = async () => {
      setIsRefreshing(true);
      try {
        const empRef = ref(db, `employees/${session}`);
        const snap = await get(empRef);
        if (snap.exists()) {
          setEmployee(snap.val());
        } else {
          localStorage.removeItem('employeeSession');
          router.push('/');
        }

        const certsRef = ref(db, 'certificates');
        const certSnap = await get(certsRef);
        if (certSnap.exists()) {
          const allCerts = Object.entries(certSnap.val()).map(([id, v]: any) => ({ id, ...v }));
          setCertificates(allCerts.filter(c => c.employee_id === session || c.employee_id === snap.val()?.employee_id));
        }

        const reqRef = ref(db, 'certificate_requests');
        const reqSnap = await get(reqRef);
        if (reqSnap.exists()) {
          const allReqs = Object.entries(reqSnap.val()).map(([id, v]: any) => ({ id, ...v }));
          setRequests(allReqs.filter(r => r.employee_id === snap.val()?.employee_id || r.employee_id === session));
        }

        const projRef = ref(db, `assigned_projects/${session}`);
        const projSnap = await get(projRef);
        if (projSnap.exists()) {
          const projs = Object.entries(projSnap.val()).map(([id, v]: any) => ({ id, ...v }));
          setProjects(projs);
        } else {
          setProjects([]);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };
    loadData();
  }, [router, refreshTrigger]);

  const handleLogout = () => {
    localStorage.removeItem('employeeSession');
    router.push('/');
  };

  const sessionTimeLeft = useInactivityTimeout(() => {
    handleLogout();
  }, 30 * 60 * 1000);

  const formatSessionTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !employee) return;
    setPassMessage({ type: '', text: '' });
    setIsChangingPass(true);

    if (employee.password !== currentPassword) {
      setPassMessage({ type: 'error', text: 'Current password is incorrect.' });
      setIsChangingPass(false);
      return;
    }

    if (newPassword.length < 6) {
      setPassMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      setIsChangingPass(false);
      return;
    }

    try {
      await set(ref(db, `employees/${employeeId}/password`), newPassword);
      setEmployee({ ...employee, password: newPassword });
      setPassMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPassMessage({ type: 'error', text: 'Failed to update password.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleRequestCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !employee || !reqTitle.trim()) return;
    setIsRequesting(true);
    try {
      await push(ref(db, 'certificate_requests'), {
        employee_id: employee.employee_id, 
        employee_name: employee.name,
        certificate_title: reqTitle,
        certificate_type: reqType,
        reason: reqReason,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      setReqMessage('Request submitted successfully!');
      setReqTitle('');
      setReqReason('');
      
      const reqRef = ref(db, 'certificate_requests');
      const reqSnap = await get(reqRef);
      if (reqSnap.exists()) {
        const allReqs = Object.entries(reqSnap.val()).map(([id, v]: any) => ({ id, ...v }));
        setRequests(allReqs.filter(r => r.employee_id === employee.employee_id || r.employee_id === employeeId));
      }
      
      setTimeout(() => setReqMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setReqMessage('Failed to submit request.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleIncompleteProject = async (projectId: string) => {
    if (!employeeId) return;
    try {
      await set(ref(db, `assigned_projects/${employeeId}/${projectId}/status`), 'incomplete');
      
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const day = String(now.getDate()).padStart(2, '0');
      
      await set(ref(db, `attendance/${employeeId}/${yearMonth}/${day}`), {
        status: 'A',
        note: 'Marked project incomplete'
      });
      
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error marking incomplete", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length < 2 || files.length > 5) {
        alert("Please select 2 to 5 images.");
        return;
      }
      
      const promises = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            const { uploadToCloudinary } = await import('@/lib/cloudinary');
            const url = await uploadToCloudinary(base64);
            resolve(url || base64);
          };
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(promises).then(base64s => {
        setSelectedImages(base64s);
      });
    }
  };

  const handleSubmitProof = async () => {
    if (!employeeId || !uploadProjectId || !uploadAction) return;
    if (selectedImages.length < 2 || selectedImages.length > 5) {
      alert("Please upload 2 to 5 images.");
      return;
    }
    
    setIsRequesting(true);
    try {
      await set(ref(db, `assigned_projects/${employeeId}/${uploadProjectId}/status`), uploadAction);
      await set(ref(db, `assigned_projects/${employeeId}/${uploadProjectId}/proofImages`), selectedImages);
      
      setShowUploadModal(false);
      setUploadProjectId(null);
      setUploadAction(null);
      setSelectedImages([]);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading || !employee) {
    return (
      <div className="bg-bg-primary min-h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gold-primary font-orbitron font-bold tracking-widest animate-pulse">AUTHENTICATING...</p>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', label: 'Profile Dossier', icon: User },
    { id: 'projects', label: 'My Projects', icon: Briefcase },
    { id: 'attendance', label: 'Attendance History', icon: Calendar },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'requests', label: 'Requests', icon: Clock },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  return (
    <div className="bg-bg-primary min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative top-0 left-0 h-screen w-[280px] md:w-64 bg-bg-card border-r border-black/20 dark:border-white/10 flex flex-col z-50 transform transition-transform duration-300 flex-shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-black/20 dark:border-white/10 flex items-center justify-between">
          <h2 className="font-orbitron font-bold text-sm md:text-base text-text-primary uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-primary animate-pulse flex-shrink-0" />
            Employee Portal
          </h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-text-muted hover:text-text-primary">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 border-b border-black/20 dark:border-white/10 flex items-center gap-4">
          {employee.profile_photo ? (
            <img src={employee.profile_photo} alt={employee.name} className="w-12 h-12 rounded-full object-cover border border-gold-primary/50" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gold-primary/10 border border-gold-primary/50 flex items-center justify-center text-gold-primary font-orbitron font-bold">
              {employee.name?.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-orbitron font-bold text-sm text-text-primary uppercase truncate w-32">{employee.name}</p>
            <p className="text-[10px] text-text-muted font-rajdhani uppercase tracking-widest">{employee.employee_id}</p>
          </div>
        </div>

        <nav className="flex flex-col py-4 md:py-6 px-4 gap-2 overflow-y-auto overscroll-contain flex-1 scroll-smooth">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all flex-shrink-0 w-full ${
                activeTab === item.id 
                  ? 'bg-gold-primary/10 text-gold-primary border border-gold-primary shadow-[0_0_8px_rgba(212,175,55,0.4)] font-bold' 
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-surface border border-transparent'
              }`}
            >
              <item.icon size={18} />
              <span className="font-rajdhani font-semibold tracking-wide">{item.label}</span>
              {item.id === 'projects' && pendingProjectsCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  {pendingProjectsCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-black/20 dark:border-white/10 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-rajdhani font-semibold tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 relative flex flex-col h-[calc(100vh-140px)] md:h-screen w-full overflow-hidden">
        <header className="flex-shrink-0 h-16 md:h-20 border-b-2 border-gold-primary/60 bg-bg-primary/50 backdrop-blur-md flex items-center justify-between px-2 md:px-8 z-10 w-full shadow-[0_4px_20px_rgba(212,175,55,0.15)] relative">
          {/* Subtle bottom glow line for header */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-primary to-transparent opacity-80"></div>
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 text-text-primary"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={handleLogout}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-red-500/10 text-xs text-red-400 border border-red-500/20"
            >
              <LogOut size={12} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          <div className="flex justify-center flex-shrink-0 scale-90 md:scale-100 transform origin-center">
            <div className="flex items-center gap-1 md:gap-2">
              <button 
                onClick={handleBack} 
                disabled={currentHistoryIndex === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-surface border border-gold-primary/20 text-gold-primary hover:bg-gold-primary/10 transition-colors disabled:opacity-30 disabled:hover:bg-bg-surface disabled:cursor-not-allowed"
                title="Go Back"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-2 text-gold-primary bg-gold-primary/10 px-4 py-1.5 rounded-full border border-gold-primary/20 shadow-sm">
                <Clock size={14} className="opacity-70" />
                <span className="text-xs font-rajdhani font-bold tracking-widest uppercase">
                  Session: <span className="font-mono text-text-primary ml-1">{formatSessionTime(sessionTimeLeft)}</span>
                </span>
              </div>

              <button 
                onClick={handleForward} 
                disabled={currentHistoryIndex === tabHistory.length - 1}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-surface border border-gold-primary/20 text-gold-primary hover:bg-gold-primary/10 transition-colors disabled:opacity-30 disabled:hover:bg-bg-surface disabled:cursor-not-allowed"
                title="Go Forward"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full border border-gold-primary/20 text-gold-primary hover:bg-gold-primary/10 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <button 
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              disabled={isRefreshing}
              className="flex items-center gap-2 text-xs font-mono text-gold-primary hover:text-gold-light bg-gold-primary/10 hover:bg-gold-primary/20 px-3 py-1.5 rounded-full border border-gold-primary/20 transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> 
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
          
          <div className="hidden md:block flex-1" />
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 z-10 w-full relative">
          <div className="flex flex-col gap-4 mb-8 w-full">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-primary to-yellow-200 tracking-wider">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
            </div>
            {/* Premium Golden Title Separator */}
            <div className="h-[2px] w-full max-w-4xl bg-gradient-to-r from-gold-primary via-gold-primary/40 to-transparent rounded-full shadow-[0_2px_10px_rgba(212,175,55,0.3)]"></div>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <img src="/banner.png" alt="Kalvix Nexus Banner" className="w-full h-auto max-h-[300px] object-cover rounded-xl border border-gold-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)] mb-6" />
              <div className="bg-bg-card border border-gold-primary/10 p-6 md:p-8 rounded-xl">
                <h3 className="font-orbitron font-bold text-lg text-text-primary mb-6 flex items-center gap-2">
                  <User size={18} className="text-gold-primary" /> Identity Portal & Profile
                </h3>

                <div className="mb-8 p-6 bg-gold-primary/10 border border-gold-primary/30 rounded-xl flex items-center justify-between shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                  <div>
                    <h4 className="font-orbitron font-bold text-lg text-text-primary mb-1">Daily Attendance</h4>
                    <p className="text-sm text-text-muted">Mark your attendance and submit today's work proof.</p>
                  </div>
                  <button onClick={() => setShowAttendanceModal(true)} className="bg-gold-primary text-black font-rajdhani font-bold px-6 py-3 rounded-lg hover:bg-gold-light transition-colors uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    Mark Present
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Interactive ID Card */}
                  <div className="flex flex-col items-center bg-bg-surface/30 p-6 rounded-2xl border border-gold-primary/10 shadow-inner">
                    <div id="employee-id-card-render" className="mb-6">
                      <EmployeeIdCard employee={employee} />
                    </div>
                    <button
                      onClick={handleDownloadIdCard}
                      className="w-full bg-gold-primary/10 hover:bg-gold-primary/20 text-gold-primary border border-gold-primary/30 py-3 rounded-xl font-rajdhani font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download size={16} /> Download My ID Card
                    </button>
                  </div>
                  
                  {/* Right Column: Profile details */}
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 h-fit">
                    <div className="group">
                      <p className="text-xs font-rajdhani text-text-muted uppercase tracking-[0.2em] mb-1">Employee ID</p>
                      <p className="text-sm font-mono text-gold-primary bg-bg-surface p-3 rounded-lg border border-gold-primary/10">{employee.employee_id}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-rajdhani text-text-muted uppercase tracking-[0.2em] mb-1">Email</p>
                      <p className="text-sm text-text-primary bg-bg-surface p-3 rounded-lg border border-gold-primary/10">{employee.email}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-rajdhani text-text-muted uppercase tracking-[0.2em] mb-1">Phone</p>
                      <p className="text-sm text-text-primary bg-bg-surface p-3 rounded-lg border border-gold-primary/10">{employee.mobile}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-rajdhani text-text-muted uppercase tracking-[0.2em] mb-1">Current Project</p>
                      <p className="text-sm text-text-primary bg-bg-surface p-3 rounded-lg border border-gold-primary/10">{employee.project || 'Unassigned'}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-rajdhani text-text-muted uppercase tracking-[0.2em] mb-1">Designation</p>
                      <p className="text-sm text-text-primary bg-bg-surface p-3 rounded-lg border border-gold-primary/10">{employee.designation}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-rajdhani text-text-muted uppercase tracking-[0.2em] mb-1">Department</p>
                      <p className="text-sm text-text-primary bg-bg-surface p-3 rounded-lg border border-gold-primary/10">{employee.department}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-rajdhani text-text-muted uppercase tracking-[0.2em] mb-1">Joining Date</p>
                      <p className="text-sm text-text-primary bg-bg-surface p-3 rounded-lg border border-gold-primary/10">
                        {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-bg-card border border-gold-primary/10 p-6 md:p-8 rounded-xl">
                <h3 className="font-orbitron font-bold text-lg text-text-primary mb-6 flex items-center gap-2"><Briefcase size={18} className="text-gold-primary" /> My Assigned Projects</h3>
                
                {projects.length === 0 ? (
                  <p className="text-text-muted text-sm font-rajdhani">No projects assigned.</p>
                ) : (
                  <div className="grid gap-4">
                    {projects.map(proj => (
                      <div key={proj.id} className="bg-bg-surface border border-gold-primary/10 p-5 rounded-xl">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-rajdhani font-bold text-gold-primary text-lg">{proj.message || 'Assigned Project'}</h4>
                            <p className="text-xs text-text-muted uppercase tracking-widest mt-1">Assigned on: {new Date(proj.assignedAt).toLocaleDateString('en-IN')}</p>
                          </div>
                          <span className={`text-[10px] font-bold font-rajdhani px-3 py-1.5 rounded uppercase tracking-[0.2em] ${
                            proj.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                            proj.status === 'submitted_full' || proj.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                            proj.status === 'submitted_half' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                            'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}>
                            {proj.status.replace('_', ' ')}
                          </span>
                        </div>
                        {proj.image && (
                          <div className="mb-4">
                            <img src={proj.image} alt="Project detail" className="max-w-xs rounded border border-gold-primary/20" />
                          </div>
                        )}
                        {proj.status === 'pending' && (
                          <div className="flex gap-3 mt-4">
                            <button onClick={() => { setUploadProjectId(proj.id); setUploadAction('submitted_full'); setShowUploadModal(true); }} className="px-4 py-2 bg-gold-primary/10 text-gold-primary border border-gold-primary/30 rounded-lg text-xs font-rajdhani uppercase tracking-widest hover:bg-gold-primary/20">Complete</button>
                            <button onClick={() => { setUploadProjectId(proj.id); setUploadAction('submitted_half'); setShowUploadModal(true); }} className="px-4 py-2 bg-gold-primary/10 text-gold-primary border border-gold-primary/30 rounded-lg text-xs font-rajdhani uppercase tracking-widest hover:bg-gold-primary/20">Half Complete</button>
                            <button onClick={() => handleIncompleteProject(proj.id)} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-rajdhani uppercase tracking-widest hover:bg-red-500/20">Incomplete</button>
                          </div>
                        )}
                        {proj.proofImages && proj.proofImages.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs text-text-muted mb-2 uppercase tracking-widest font-rajdhani">Submitted Proofs:</p>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {proj.proofImages.map((img: string, idx: number) => (
                                <img key={idx} src={img} alt={`Proof ${idx+1}`} className="h-20 rounded border border-gold-primary/20 object-cover" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-bg-card border border-gold-primary/10 p-6 md:p-8 rounded-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="font-orbitron font-bold text-lg text-text-primary flex items-center gap-2">
                    <Calendar size={18} className="text-gold-primary" /> Attendance History
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-rajdhani uppercase tracking-widest text-text-muted">Month:</label>
                    <input 
                      type="month"
                      min="2026-06"
                      value={selectedAttendanceMonth}
                      onChange={(e) => setSelectedAttendanceMonth(e.target.value)}
                      className="bg-bg-surface border border-gold-primary/30 rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-gold-primary cursor-pointer font-mono"
                    />
                  </div>
                </div>
                
                {Object.keys(attendanceHistory).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 bg-bg-surface/30 rounded-xl border border-dashed border-gold-primary/20">
                    <Calendar size={40} className="text-gold-primary/30 mb-3" />
                    <p className="text-text-muted text-sm font-rajdhani uppercase tracking-widest">No attendance records for {new Date(parseInt(selectedAttendanceMonth.split('-')[0]), parseInt(selectedAttendanceMonth.split('-')[1]) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
                  </div>
                ) : (
                  <>
                    {(() => {
                      let present = 0;
                      let absent = 0;
                      Object.values(attendanceHistory).forEach((d: any) => {
                        if (d.status === 'P' || d.status === 'Present' || d.status === 'HP' || d.status === 'Half Present') present++;
                        if (d.status === 'A' || d.status === 'Absent') absent++;
                      });
                      const total = present + absent;
                      const presentRatio = total === 0 ? 0 : (present / total) * 100;
                      
                      return (
                        <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-8 bg-bg-surface/50 border border-gold-primary/10 p-6 rounded-xl shadow-inner">
                          <div className="relative w-32 h-32">
                            <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                              <circle r="16" cx="16" cy="16" fill="#ef4444" />
                              <circle 
                                r="16" 
                                cx="16" 
                                cy="16" 
                                fill="transparent" 
                                stroke="#22c55e" 
                                strokeWidth="32" 
                                strokeDasharray={`${presentRatio} 100`} 
                                className="transition-all duration-1000 ease-out"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-20 h-20 bg-bg-card rounded-full flex items-center justify-center shadow-inner">
                                <span className="font-orbitron font-bold text-lg text-text-primary">{Math.round(presentRatio)}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                              <span className="font-rajdhani font-bold text-text-primary tracking-widest uppercase">Present: {present} Days</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                              <span className="font-rajdhani font-bold text-text-primary tracking-widest uppercase">Absent: {absent} Days</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {(() => {
                      const [yearStr, monthStr] = selectedAttendanceMonth.split('-');
                      const selectedYear = parseInt(yearStr);
                      const selectedMonthIdx = parseInt(monthStr) - 1;
                      
                      const monthName = new Date(selectedYear, selectedMonthIdx).toLocaleString('default', { month: 'long', year: 'numeric' });
                      const daysInMonth = new Date(selectedYear, selectedMonthIdx + 1, 0).getDate();
                      const daysArray = Array.from({length: daysInMonth}, (_, i) => String(i + 1).padStart(2, '0'));
                      
                      const getStatusColor = (status: string) => {
                        if (status === 'P' || status === 'Present') return 'bg-green-500/20 text-green-500 border-green-500/30';
                        if (status === 'HP' || status === 'Half Present') return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
                        if (status === 'A' || status === 'Absent') return 'bg-red-500/20 text-red-500 border-red-500/30';
                        if (status === 'S' || status === 'Sunday') return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
                        return 'bg-bg-surface text-transparent border-black/10 dark:border-white/10';
                      };

                      return (
                        <div className="bg-bg-surface/30 p-6 rounded-xl border border-gold-primary/10 shadow-inner">
                          <h4 className="font-rajdhani font-bold text-text-primary tracking-widest uppercase mb-6 text-sm">Monthly Overview - {monthName}</h4>
                          <div className="flex flex-wrap gap-3 pb-2">
                            {daysArray.map(day => {
                              const dayData = attendanceHistory[day] || {};
                              const status = dayData.status || '-';
                              const displayStatus = status === 'P' || status === 'Present' ? 'P' :
                                                    status === 'HP' || status === 'Half Present' ? 'HP' :
                                                    status === 'A' || status === 'Absent' ? 'A' :
                                                    status === 'S' || status === 'Sunday' ? 'S' : '-';
                              return (
                                <div key={day} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                                  <span className="text-[10px] font-orbitron text-text-muted">{day}</span>
                                  <div 
                                    onClick={() => {
                                      if (dayData.work_photo || dayData.work_done) {
                                        setPhotoData({
                                          date: `${day}/${String(selectedMonthIdx + 1).padStart(2, '0')}`,
                                          photo: dayData.work_photo || null,
                                          workDone: dayData.work_done || 'No work description provided.'
                                        });
                                        setShowPhotoModal(true);
                                      }
                                    }}
                                    title={`Day ${day}: ${status}`}
                                    className={`w-10 h-10 rounded-md border flex items-center justify-center text-[11px] font-bold ${dayData.work_done ? 'cursor-pointer ring-1 ring-gold-primary ring-offset-1 ring-offset-bg-card' : 'cursor-default'} hover:scale-110 transition-all ${getStatusColor(status)}`}
                                  >
                                    {displayStatus !== '-' ? displayStatus : ''}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] font-rajdhani font-bold uppercase tracking-widest text-text-muted">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30"></span> Present</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30"></span> Absent</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30"></span> Half Present</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30"></span> Sunday</div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-bg-card border border-gold-primary/10 p-6 md:p-8 rounded-xl">
                <h3 className="font-orbitron font-bold text-lg text-text-primary mb-6 flex items-center gap-2"><Award size={18} className="text-gold-primary" /> Issued Certificates</h3>
                
                {certificates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gold-primary/20 rounded-xl bg-gold-primary/5">
                    <Award size={48} className="text-gold-primary/30 mb-4" />
                    <p className="text-text-muted text-sm font-rajdhani uppercase tracking-widest text-center">No certificates have been issued to your profile yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {certificates.map(cert => (
                      <div key={cert.id} className="group flex flex-col sm:flex-row sm:items-center justify-between bg-bg-surface border border-gold-primary/10 hover:border-gold-primary/40 p-5 rounded-xl transition-all duration-300">
                        <div className="mb-4 sm:mb-0">
                          <h3 className="font-rajdhani font-bold text-lg text-gold-primary tracking-wide">{cert.certificate_title}</h3>
                          <p className="text-xs text-text-muted font-rajdhani uppercase tracking-widest mt-1">
                            <span className="text-gold-primary/70">{cert.certificate_type}</span> <span className="mx-2 opacity-30">|</span> {new Date(cert.issue_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        {cert.pdf_file && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(cert, 'view')}
                              disabled={activeActionId !== null}
                              className="flex items-center justify-center px-6 py-2 border border-gold-primary/30 text-gold-primary/85 hover:bg-gold-primary/10 rounded-lg text-xs font-rajdhani font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-50"
                            >
                              {activeActionId === cert.id + '-view' ? <Loader2 size={12} className="animate-spin" /> : 'View PDF'}
                            </button>
                            <button
                              onClick={() => handleAction(cert, 'download')}
                              disabled={activeActionId !== null}
                              className="flex items-center justify-center px-6 py-2 border border-gold-primary text-gold-primary hover:bg-gold-primary hover:text-black rounded-lg text-xs font-rajdhani font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-50"
                            >
                              {activeActionId === cert.id + '-download' ? <Loader2 size={12} className="animate-spin" /> : 'Download PDF'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-bg-card border border-gold-primary/10 p-6 md:p-8 rounded-xl h-fit">
                  <h3 className="font-orbitron font-bold text-lg text-text-primary mb-6 flex items-center gap-2"><Send size={18} className="text-gold-primary" /> New Request</h3>
                  
                  {reqMessage && (
                    <div className="mb-6 p-4 rounded-xl text-xs flex items-center gap-3 font-rajdhani font-bold uppercase tracking-widest bg-gold-primary/10 text-gold-primary border border-gold-primary/30">
                      <ShieldCheck size={16} />
                      {reqMessage}
                    </div>
                  )}

                  <form onSubmit={handleRequestCertificate} className="space-y-5">
                    <div>
                      <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-[0.1em] block mb-2">Certificate Title *</label>
                      <input
                        type="text"
                        required
                        value={reqTitle}
                        onChange={e => setReqTitle(e.target.value)}
                        placeholder="e.g. Employee of the Month"
                        className="w-full bg-bg-surface border border-gold-primary/20 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-gold-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-[0.1em] block mb-2">Category</label>
                      <select
                        value={reqType}
                        onChange={e => setReqType(e.target.value)}
                        className="w-full bg-bg-surface border border-gold-primary/20 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-gold-primary"
                      >
                        {['Achievement', 'Appreciation', 'Completion', 'Excellence', 'Participation', 'Recognition', 'Service'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-[0.1em] block mb-2">Justification / Details</label>
                      <textarea
                        value={reqReason}
                        onChange={e => setReqReason(e.target.value)}
                        placeholder="Provide details for the request..."
                        className="w-full bg-bg-surface border border-gold-primary/20 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-gold-primary h-24 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isRequesting}
                      className="w-full py-3 bg-gold-primary text-black font-rajdhani font-bold uppercase tracking-[0.1em] rounded-xl flex items-center justify-center transition-all hover:bg-gold-light disabled:opacity-50"
                    >
                      {isRequesting ? 'Transmitting...' : 'Submit Request'}
                    </button>
                  </form>
                </div>

                <div className="bg-bg-card border border-gold-primary/10 p-6 md:p-8 rounded-xl h-fit">
                  <h3 className="font-orbitron font-bold text-lg text-text-primary mb-6 flex items-center gap-2"><Clock size={18} className="text-gold-primary" /> Request Status</h3>
                  
                  {requests.length === 0 ? (
                    <p className="text-text-muted text-sm font-rajdhani py-4 text-center">No pending requests.</p>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                      {requests.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(req => (
                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-bg-surface border border-gold-primary/10 p-4 rounded-xl gap-4">
                          <div>
                            <h3 className="font-rajdhani font-bold text-text-primary">{req.certificate_title}</h3>
                            <p className="text-[10px] text-text-muted font-rajdhani uppercase tracking-widest mt-1">{req.certificate_type} • {new Date(req.timestamp).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div>
                            <span className={`text-[10px] font-bold font-rajdhani px-3 py-1.5 rounded uppercase tracking-[0.2em] whitespace-nowrap ${
                              req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' :
                              req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                              'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-bg-card border border-gold-primary/10 p-6 md:p-8 rounded-xl max-w-xl">
                <h3 className="font-orbitron font-bold text-lg text-text-primary mb-6 flex items-center gap-2"><ShieldCheck size={18} className="text-gold-primary" /> Account Security</h3>
                
                {passMessage.text && (
                  <div className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-3 font-rajdhani font-bold uppercase tracking-widest ${passMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                    {passMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {passMessage.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-[0.1em] block mb-2">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full bg-bg-surface border border-gold-primary/20 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-gold-primary"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-[0.1em] block mb-2">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-bg-surface border border-gold-primary/20 rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-gold-primary"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="w-full mt-4 py-3 bg-gold-primary text-black font-rajdhani font-bold uppercase tracking-[0.1em] rounded-xl flex items-center justify-center transition-all hover:bg-gold-light disabled:opacity-50"
                  >
                    {isChangingPass ? 'Authenticating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
      
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-gold-primary/20 p-6 md:p-8 rounded-xl max-w-md w-full shadow-2xl">
            <h3 className="font-orbitron font-bold text-lg text-text-primary mb-4">Upload Proof of Completion</h3>
            <p className="text-sm text-text-muted mb-6 font-rajdhani">Please select 2 to 5 images as proof.</p>
            
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageSelect} 
              className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold-primary/10 file:text-gold-primary hover:file:bg-gold-primary/20 mb-4"
            />
            
            {selectedImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto mb-6 py-2">
                {selectedImages.map((src, i) => (
                  <img key={i} src={src} alt={`preview ${i}`} className="h-16 w-16 object-cover rounded border border-gold-primary/30" />
                ))}
              </div>
            )}
            
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => { setShowUploadModal(false); setSelectedImages([]); }}
                className="px-4 py-2 rounded-lg border border-gold-primary/20 text-text-primary hover:bg-white/5 font-rajdhani tracking-wider text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitProof}
                disabled={isRequesting || selectedImages.length < 2 || selectedImages.length > 5}
                className="px-4 py-2 rounded-lg bg-gold-primary text-black font-rajdhani font-bold tracking-wider text-sm hover:bg-gold-light disabled:opacity-50"
              >
                {isRequesting ? 'Uploading...' : 'Submit Proof'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-gold-primary/20 p-6 md:p-8 rounded-xl max-w-md w-full relative shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            <button onClick={() => setShowAttendanceModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-red-400 transition-colors">
              <X size={24} />
            </button>
            <h3 className="font-orbitron font-bold text-xl text-text-primary mb-6 flex items-center gap-2">
              <CheckCircle className="text-gold-primary" /> Mark Present
            </h3>
            {attendanceMessage.text && (
              <div className={`mb-6 p-3 rounded-lg text-sm border ${attendanceMessage.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-green-500/10 border-green-500/50 text-green-400'}`}>
                {attendanceMessage.text}
              </div>
            )}
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">What work did you do today? *</label>
                <textarea required value={workDone} onChange={(e) => setWorkDone(e.target.value)} className="w-full bg-bg-surface border border-gold-primary/30 rounded-lg p-3 text-sm text-text-primary focus:border-gold-primary outline-none min-h-[100px]" placeholder="Briefly describe your tasks..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-2">Upload Photo of Work *</label>
                <input type="file" accept="image/*" required onChange={handleWorkPhotoUpload} className="w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-rajdhani file:font-bold file:bg-gold-primary/20 file:text-gold-primary hover:file:bg-gold-primary/30" />
                {workPhoto && <img src={workPhoto} alt="Work preview" className="mt-4 w-full h-32 object-cover rounded-lg border border-gold-primary/30" />}
              </div>
              <button type="submit" disabled={isSubmittingAttendance} className="w-full bg-gold-primary text-black font-rajdhani font-bold py-3 rounded-lg hover:bg-gold-light transition-colors uppercase tracking-widest mt-6 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                {isSubmittingAttendance ? <Loader2 className="animate-spin" size={18} /> : 'Submit Attendance'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Photo View Modal (For viewing past attendance) */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-gold-primary/20 p-6 rounded-xl max-w-lg w-full relative shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            <button onClick={() => setShowPhotoModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-red-400 transition-colors">
              <X size={24} />
            </button>
            <h3 className="font-orbitron font-bold text-lg text-gold-primary mb-1">Work Proof</h3>
            <p className="text-xs text-text-muted font-rajdhani uppercase tracking-widest mb-6">Date: {photoData.date}</p>
            
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
