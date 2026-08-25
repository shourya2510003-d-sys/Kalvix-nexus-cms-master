'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ref, get, set, push, remove, onValue, runTransaction, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import EmployeeIdCard from '@/components/EmployeeIdCard';
import {
  Users, Plus, Search, Eye, Edit3, Trash2, Award, X, Save,
  Camera, CheckCircle, XCircle, Download, User, Phone, Mail,
  MapPin, Calendar, Briefcase, Building2, FolderOpen, Shield,
  ChevronLeft, QrCode, FileText, Loader2, AlertTriangle, CreditCard, Power
} from 'lucide-react';
import { getCertificateAssets, generateCertificatePDF, resizeImageBase64 } from '@/lib/pdfUtils';
import { deleteImageFromCloudinary } from '@/actions/cloudinary';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Employee {
  id: string;
  employee_id: string;
  name: string;
  address: string;
  age: string;
  mobile: string;
  email: string;
  designation: string;
  department: string;
  project: string;
  joining_date: string;
  profile_photo: string;
  status: 'Active' | 'Inactive';
  password?: string;
  image?: string;
  role?: string;
  blood_group?: string;
}

interface Certificate {
  id: string;
  employee_id: string;
  certificate_title: string;
  certificate_type: string;
  issue_date: string;
  issued_by: string;
  qr_code: string;
  pdf_file: string;
  verification_status: string;
  certificate_id: string;
}

type View = 'list' | 'add' | 'edit' | 'profile' | 'requests';

const EMPTY_EMP: Omit<Employee, 'id'> = {
  employee_id: '',
  name: '',
  address: '',
  age: '',
  mobile: '',
  email: '',
  designation: '',
  department: '',
  project: '',
  joining_date: '',
  profile_photo: '',
  status: 'Active',
};

// ─── Utilities ───────────────────────────────────────────────────────────────
function generateEmployeeId(employees: any[]): string {
  const maxId = employees.reduce((max, emp) => {
    const num = parseInt(emp.employee_id?.replace('KNX', ''), 10);
    return !isNaN(num) && num > max ? num : max;
  }, 0);
  return `KNX${String(maxId + 1).padStart(3, '0')}`;
}

async function generateCertId(): Promise<string> {
  const year = new Date().getFullYear();
  const counterRef = ref(db, 'cert_counter/count');
  let newCount = 1;
  await runTransaction(counterRef, (current) => {
    newCount = (current || 0) + 1;
    return newCount;
  });
  return `KNX/INT/${year}/${String(newCount).padStart(4, '0')}`;
}

async function generateQRCodeDataUrl(text: string): Promise<string> {
  const QRCode = (await import('qrcode')).default;
  return QRCode.toDataURL(text, { width: 200, margin: 2, color: { dark: '#0A0A0A', light: '#FFFFFF' } });
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-rajdhani font-bold uppercase tracking-wider ${
      status === 'Active'
        ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
        : 'bg-red-400/10 text-red-400 border border-red-400/20'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {status}
    </span>
  );
}

function Avatar({ src, name, size = 'md' }: { src?: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm';
  if (src) return <img src={src} alt={name} className={`${sizeClass} rounded-full object-cover border-2 border-gold-primary/30`} />;
  return (
    <div className={`${sizeClass} rounded-full bg-gold-primary/10 border-2 border-gold-primary/30 flex items-center justify-center font-orbitron font-black text-gold-primary`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── ID Card Modal ────────────────────────────────────────────────────────────
function IdCardModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-bg-card border border-gold-primary/30 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10 relative z-10 bg-bg-card">
          <h2 className="font-orbitron font-bold text-text-primary text-lg flex items-center gap-2">
            <CreditCard size={18} className="text-gold-primary" /> Employee ID Card
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors bg-bg-surface p-1 rounded-full border border-white/5">
            <X size={18} />
          </button>
        </div>
        
        {/* ID Card Display */}
        <div className="p-6 bg-bg-surface/50 flex justify-center pb-2">
          <EmployeeIdCard employee={employee as any} />
        </div>
        
        {/* Actions */}
        <div className="p-4 border-t border-white/10 bg-bg-card flex justify-end gap-3">
          <a
            href={`/verify-employee?id=${employee.employee_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-gold-primary text-black font-rajdhani font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded hover:bg-gold-light transition-colors"
          >
            Open Public Verification Link
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Certificate Modal ────────────────────────────────────────────────────────
function CertModal({ employee, onClose, onIssued, initialTitle = '', initialType = 'Achievement', requestId = null }: {
  employee: Employee;
  onClose: () => void;
  onIssued: (cert: Certificate) => void;
  initialTitle?: string;
  initialType?: string;
  requestId?: string | null;
}) {
  const [certTitle, setCertTitle] = useState(initialTitle);
  const [certType, setCertType] = useState(initialType);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [issuedBy, setIssuedBy] = useState('Kalvix Nexus');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!certTitle.trim()) { setError('Certificate title is required'); return; }
    setIsGenerating(true);
    setError('');
    try {
      const certId = await generateCertId();
      const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://kalvixnexus.com'}/verify?id=${certId}`;
      const qrDataUrl = await generateQRCodeDataUrl(verifyUrl);

      const assets = await getCertificateAssets();
      const pdfDataUrl = await generateCertificatePDF(
        employee,
        certId,
        certTitle,
        certType,
        issueDate,
        issuedBy,
        qrDataUrl,
        assets.logoDataUrl,
        assets.stampDataUrl,
        assets.ceoSignatureDataUrl,
        assets.ctoSignatureDataUrl,
        assets.ceoName,
        assets.ceoRole,
        assets.ctoName,
        assets.ctoRole
      );

      const certData = {
        employee_id: employee.id,
        employee_name: employee.name,
        certificate_title: certTitle,
        certificate_type: certType,
        issue_date: issueDate,
        issued_by: issuedBy,
        qr_code: qrDataUrl,
        pdf_file: pdfDataUrl,
        verification_status: 'valid',
        certificate_id: certId,
        created_at: new Date().toISOString(),
      };

      await set(ref(db, `certificates/${certId}`), certData);

      if (requestId) {
        await update(ref(db, `certificate_requests/${requestId}`), { status: 'approved' });
      }

      // Auto-download PDF
      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = `${certId}-${employee.name.replace(/\s+/g, '_')}.pdf`;
      link.click();

      onIssued({ id: certId, ...certData } as Certificate);
      onClose();
    } catch (err: any) {
      setError('Failed to generate certificate: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-bg-card border border-gold-primary/30 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-primary to-transparent" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center text-gold-primary">
                <Award size={20} />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-text-primary text-base">Issue Certificate</h3>
                <p className="text-xs text-text-muted mt-0.5">For: {employee.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-widest mb-1 block">Certificate Title *</label>
              <input
                type="text"
                value={certTitle}
                onChange={e => setCertTitle(e.target.value)}
                placeholder="e.g. Employee of the Month"
                className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg py-2.5 px-3 text-sm text-text-primary focus:border-gold-primary/50 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-widest mb-1 block">Certificate Type</label>
                <select
                  value={certType}
                  onChange={e => setCertType(e.target.value)}
                  className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg py-2.5 px-3 text-sm text-text-primary focus:border-gold-primary/50 focus:outline-none"
                >
                  {['Achievement', 'Appreciation', 'Completion', 'Excellence', 'Participation', 'Recognition', 'Service'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-widest mb-1 block">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                  className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg py-2.5 px-3 text-sm text-text-primary focus:border-gold-primary/50 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-widest mb-1 block">Issued By (Authorized Signatory)</label>
              <input
                type="text"
                value={issuedBy}
                onChange={e => setIssuedBy(e.target.value)}
                className="w-full bg-bg-surface border border-gold-primary/20 rounded-lg py-2.5 px-3 text-sm text-text-primary focus:border-gold-primary/50 focus:outline-none"
              />
            </div>

            <div className="bg-bg-surface border border-gold-primary/10 rounded-lg p-3 text-xs text-text-muted space-y-1">
              <p className="flex items-center gap-2"><QrCode size={12} className="text-gold-primary" /> QR code will be auto-generated linking to the verification page</p>
              <p className="flex items-center gap-2"><FileText size={12} className="text-gold-primary" /> PDF will be automatically downloaded after generation</p>
              <p className="flex items-center gap-2"><Shield size={12} className="text-gold-primary" /> Certificate ID format: KNX/INT/{new Date().getFullYear()}/XXXX</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 border border-gold-primary/20 text-text-muted hover:text-text-primary py-2.5 rounded-lg text-sm font-rajdhani font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 bg-gold-primary hover:bg-gold-light text-black py-2.5 rounded-lg text-sm font-rajdhani font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {isGenerating ? (
                <><Loader2 size={16} className="animate-spin" /> Generating...</>
              ) : (
                <><Award size={16} /> Issue Certificate</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Employee Form ────────────────────────────────────────────────────────────
function EmployeeForm({ initial, onSave, onCancel, employees }: {
  initial?: Employee;
  onSave: (data: Omit<Employee, 'id'>) => Promise<void>;
  onCancel: () => void;
  employees: Employee[];
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState<Omit<Employee, 'id'>>(initial
    ? { ...initial }
    : { ...EMPTY_EMP, employee_id: generateEmployeeId(employees) }
  );
  const [isSaving, setIsSaving] = useState(false);

  const set_ = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const { uploadToCloudinary } = await import('@/lib/cloudinary');
      const url = await uploadToCloudinary(base64);
      if (url) {
        set_('profile_photo', url);
      } else {
        alert('Failed to upload photo. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(form);
    setIsSaving(false);
  };

  const fields: { key: keyof typeof form; label: string; type?: string; required?: boolean }[] = [
    { key: 'employee_id', label: 'Employee ID', required: true },
    { key: 'name', label: 'Full Name', required: true },
    { key: 'address', label: 'Address', required: true },
    { key: 'age', label: 'Age', type: 'number', required: true },
    { key: 'mobile', label: 'Mobile Number', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'designation', label: 'Designation', required: true },
    { key: 'department', label: 'Department', required: true },
    { key: 'project', label: 'Project Name', required: true },
    { key: 'joining_date', label: 'Joining Date', type: 'date', required: true },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={onCancel} className="p-2 text-text-muted hover:text-gold-primary hover:bg-gold-primary/5 rounded-lg transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="font-orbitron font-bold text-xl text-text-primary">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
          <p className="text-xs text-text-muted mt-0.5">{isEdit ? `Editing: ${initial?.name}` : 'Fill in the details below'}</p>
        </div>
      </div>

      {/* Photo + basic fields */}
      <div className="bg-bg-card border border-gold-primary/10 rounded-2xl p-6">
        <h3 className="font-rajdhani font-bold text-sm text-gold-primary uppercase tracking-widest mb-4">Profile Photo</h3>
        <div className="flex items-center gap-6">
          {form.profile_photo ? (
            <img src={form.profile_photo} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gold-primary/40" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gold-primary/10 border-2 border-gold-primary/20 border-dashed flex items-center justify-center text-gold-primary">
              <Camera size={24} />
            </div>
          )}
          <div>
            <label className="cursor-pointer bg-gold-primary/10 hover:bg-gold-primary/20 border border-gold-primary/30 text-gold-primary px-4 py-2 rounded-lg text-sm font-rajdhani font-bold flex items-center gap-2 transition-colors">
              <Camera size={14} /> Upload Photo
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
            <p className="text-xs text-text-muted mt-1.5">JPG, PNG, WEBP — max 2MB</p>
          </div>
        </div>
      </div>

      <div className="bg-bg-card border border-gold-primary/10 rounded-2xl p-6">
        <h3 className="font-rajdhani font-bold text-sm text-gold-primary uppercase tracking-widest mb-4">Employee Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(({ key, label, type = 'text', required }) => (
            <div key={key}>
              <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-widest mb-1.5 block">{label}{required && ' *'}</label>
              <input
                type={type}
                value={form[key] as string}
                onChange={e => set_(key, e.target.value)}
                required={required}
                readOnly={key === 'employee_id' && isEdit}
                className="w-full bg-bg-surface border border-gold-primary/10 rounded-lg py-2.5 px-3 text-sm text-text-primary focus:border-gold-primary/40 focus:outline-none transition-colors disabled:opacity-60"
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-rajdhani font-bold text-text-muted uppercase tracking-widest mb-1.5 block">Status *</label>
            <select
              value={form.status}
              onChange={e => set_('status', e.target.value as 'Active' | 'Inactive')}
              className="w-full bg-bg-surface border border-gold-primary/10 rounded-lg py-2.5 px-3 text-sm text-text-primary focus:border-gold-primary/40 focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button type="button" onClick={onCancel} className="flex-1 border border-gold-primary/20 text-text-muted hover:text-text-primary py-3 rounded-xl text-sm font-rajdhani font-bold transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isSaving} className="flex-1 bg-gold-primary hover:bg-gold-light text-black py-3 rounded-xl text-sm font-rajdhani font-bold flex items-center justify-center gap-2 transition-colors">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isEdit ? 'Update Employee' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
}

function EmployeeProfile({ employee, certificates, onBack, onEdit, onIssueCert, onDelete, onResetPassword, onToggleStatus }: {
  employee: Employee;
  certificates: Certificate[];
  onBack: () => void;
  onEdit: () => void;
  onIssueCert: () => void;
  onDelete: () => void;
  onResetPassword: () => void;
  onToggleStatus: () => void;
}) {
  const empCerts = certificates.filter(c => c.employee_id === employee.id);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const handleAction = async (cert: Certificate, type: 'view' | 'download') => {
    const actionKey = cert.id + '-' + type;
    setActiveActionId(actionKey);
    try {
      const assets = await getCertificateAssets();
      const pdfDataUrl = await generateCertificatePDF(
        employee,
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
      console.error('Failed to regenerate PDF', err);
    } finally {
      setActiveActionId(null);
    }
  };

  const infoItems = [
    { icon: User, label: 'Employee ID', value: employee.employee_id },
    { icon: Mail, label: 'Email', value: employee.email },
    { icon: Phone, label: 'Mobile', value: employee.mobile },
    { icon: MapPin, label: 'Address', value: employee.address },
    { icon: Briefcase, label: 'Designation', value: employee.designation },
    { icon: Building2, label: 'Department', value: employee.department },
    { icon: FolderOpen, label: 'Project', value: employee.project },
    { icon: Calendar, label: 'Joining Date', value: new Date(employee.joining_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) },
    { icon: User, label: 'Age', value: `${employee.age} years` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 text-text-muted hover:text-gold-primary hover:bg-gold-primary/5 rounded-lg transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="font-orbitron font-bold text-xl text-text-primary">Employee Profile</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={onIssueCert} className="flex items-center gap-2 bg-gold-primary hover:bg-gold-light text-black px-4 py-2 rounded-lg text-xs font-rajdhani font-bold transition-colors">
            <Award size={14} /> Issue Certificate
          </button>
          <button onClick={onEdit} className="flex items-center gap-2 border border-gold-primary/30 text-gold-primary hover:bg-gold-primary/10 px-4 py-2 rounded-lg text-xs font-rajdhani font-bold transition-colors">
            <Edit3 size={14} /> Edit
          </button>
          <button onClick={onResetPassword} className="flex items-center gap-2 border border-blue-400/30 text-blue-400 hover:bg-blue-400/10 px-4 py-2 rounded-lg text-xs font-rajdhani font-bold transition-colors">
            <Shield size={14} /> Reset Password
          </button>
          <button onClick={onToggleStatus} className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-xs font-rajdhani font-bold transition-colors ${employee.status === 'Active' ? 'border-orange-400/30 text-orange-400 hover:bg-orange-400/10' : 'border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10'}`}>
            <Power size={14} /> {employee.status === 'Active' ? 'Mark Inactive' : 'Mark Active'}
          </button>
          <button onClick={onDelete} className="flex items-center gap-2 border border-red-400/30 text-red-400 hover:bg-red-400/10 px-4 py-2 rounded-lg text-xs font-rajdhani font-bold transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-bg-card border border-gold-primary/15 rounded-2xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-gold-primary/5 via-gold-primary/20 to-gold-primary/5 relative border-b border-gold-primary/10">
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(212,175,55,0.6) 0%, transparent 60%)' }} />
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="border-4 border-bg-card rounded-full relative z-10">
              <Avatar src={employee.profile_photo} name={employee.name} size="lg" />
            </div>
            <div className="pb-1">
              <h3 className="font-orbitron font-bold text-xl text-text-primary">{employee.name}</h3>
              <p className="text-gold-primary text-sm font-rajdhani font-semibold">{employee.designation}</p>
            </div>
            <div className="ml-auto pb-1">
              <StatusBadge status={employee.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-bg-surface border border-gold-primary/8 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={13} className="text-gold-primary" />
                  <span className="text-[10px] font-rajdhani font-bold uppercase tracking-widest text-text-muted">{label}</span>
                </div>
                <p className="text-sm text-text-primary font-medium">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificates Section */}
      <div className="bg-bg-card border border-gold-primary/15 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-orbitron font-bold text-base text-text-primary flex items-center gap-2">
            <Award size={18} className="text-gold-primary" /> Issued Certificates
          </h3>
          <span className="text-xs text-text-muted bg-bg-surface px-2 py-1 rounded-full border border-gold-primary/10">{empCerts.length} total</span>
        </div>

        {empCerts.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <Award size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-rajdhani">No certificates issued yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {empCerts.map(cert => (
              <div key={cert.id} className="bg-bg-surface border border-gold-primary/10 hover:border-gold-primary/25 rounded-xl p-4 flex items-center gap-4 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center text-gold-primary flex-shrink-0">
                  <Award size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-rajdhani font-bold text-sm text-text-primary truncate">{cert.certificate_title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{cert.certificate_type} · {cert.certificate_id} · {new Date(cert.issue_date).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {cert.qr_code && <img src={cert.qr_code} alt="QR" className="w-10 h-10 rounded border border-gold-primary/20 bg-white p-0.5" />}
                  {cert.pdf_file && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAction(cert, 'view')}
                        disabled={activeActionId !== null}
                        className="p-2 text-gold-primary hover:bg-gold-primary/10 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                        title="View PDF"
                      >
                        {activeActionId === cert.id + '-view' ? <Loader2 size={14} className="animate-spin" /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleAction(cert, 'download')}
                        disabled={activeActionId !== null}
                        className="p-2 text-gold-primary hover:bg-gold-primary/10 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                        title="Download PDF"
                      >
                        {activeActionId === cert.id + '-download' ? <Loader2 size={14} className="animate-spin" /> : <Download size={16} />}
                      </button>
                    </div>
                  )}
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">VALID</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Employee List ────────────────────────────────────────────────────────────
function EmployeeList({ employees, onAdd, onView, onEdit, onDelete, onIssueCert, onGenerateIdCard }: {
  employees: Employee[];
  onAdd: () => void;
  onView: (e: Employee) => void;
  onEdit: (e: Employee) => void;
  onDelete: (e: Employee) => void;
  onIssueCert: (e: Employee) => void;
  onGenerateIdCard: (e: Employee) => void;
}) {
  const [search, setSearch] = useState('');
  const [filterBy, setFilterBy] = useState<'name' | 'employee_id' | 'project' | 'designation'>('name');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const filtered = employees.filter(emp => {
    const matchSearch = emp[filterBy]?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => (a.employee_id || '').localeCompare(b.employee_id || ''));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-orbitron font-bold text-xl text-text-primary">Employee Directory</h2>
          <p className="text-xs text-text-muted mt-0.5">{employees.length} employee{employees.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => document.dispatchEvent(new CustomEvent('switch-view', { detail: 'requests' }))}
            className="flex items-center gap-2 border border-gold-primary/30 hover:bg-gold-primary/10 text-gold-primary px-5 py-2.5 rounded-xl text-sm font-rajdhani font-bold transition-colors"
          >
            Pending Requests
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-gold-primary hover:bg-gold-light text-black px-5 py-2.5 rounded-xl text-sm font-rajdhani font-bold transition-colors shadow-gold"
          >
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search by ${filterBy.replace('_', ' ')}...`}
            className="w-full bg-bg-card border border-gold-primary/15 rounded-xl py-2.5 pl-9 pr-4 text-sm text-text-primary focus:border-gold-primary/40 focus:outline-none"
          />
        </div>
        <select
          value={filterBy}
          onChange={e => setFilterBy(e.target.value as typeof filterBy)}
          className="bg-bg-card border border-gold-primary/15 rounded-xl py-2.5 px-3 text-sm text-text-primary focus:border-gold-primary/40 focus:outline-none"
        >
          <option value="name">By Name</option>
          <option value="employee_id">By Employee ID</option>
          <option value="project">By Project</option>
          <option value="designation">By Designation</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="bg-bg-card border border-gold-primary/15 rounded-xl py-2.5 px-3 text-sm text-text-primary focus:border-gold-primary/40 focus:outline-none"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-gold-primary/10 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users size={40} className="mx-auto mb-4 text-text-muted opacity-30" />
            <p className="text-text-muted text-sm font-rajdhani">
              {employees.length === 0 ? 'No employees yet. Add your first employee!' : 'No employees match your search.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold-primary/10 bg-bg-surface">
                  {['Employee ID', 'Photo & Name', 'Designation', 'Project', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-rajdhani font-bold uppercase tracking-widest text-text-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-primary/5">
                {filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-bg-surface/50 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gold-primary bg-gold-primary/5 px-2 py-0.5 rounded border border-gold-primary/10">{emp.employee_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <button onClick={() => emp.profile_photo && setPreviewPhoto(emp.profile_photo)} className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none">
                          <Avatar src={emp.profile_photo} name={emp.name} size="sm" />
                        </button>
                        <div className="flex flex-col items-start">
                          <button onClick={() => onView(emp)} className="text-sm font-rajdhani font-bold text-text-primary whitespace-nowrap hover:text-gold-primary transition-colors text-left focus:outline-none">{emp.name}</button>
                          <p className="text-[10px] text-text-muted">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-muted whitespace-nowrap">{emp.designation}</td>
                    <td className="px-4 py-3 text-sm text-text-muted whitespace-nowrap">{emp.project}</td>
                    <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onView(emp)} title="View Profile" className="p-1.5 text-text-muted hover:text-gold-primary hover:bg-gold-primary/10 rounded-lg transition-colors">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => onGenerateIdCard(emp)} title="Generate ID Card" className="p-1.5 text-text-muted hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                          <CreditCard size={15} />
                        </button>
                        <button onClick={() => onEdit(emp)} title="Edit" className="p-1.5 text-text-muted hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => onIssueCert(emp)} title="Issue Certificate" className="p-1.5 text-text-muted hover:text-gold-primary hover:bg-gold-primary/10 rounded-lg transition-colors">
                          <Award size={15} />
                        </button>
                        <button onClick={() => onDelete(emp)} title="Delete" className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setPreviewPhoto(null)}>
          <div className="relative max-w-xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewPhoto(null)} className="absolute -top-12 right-0 text-white hover:text-gold-primary transition-colors focus:outline-none">
              <X size={32} />
            </button>
            <img src={previewPhoto} alt="Employee Profile" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.15)] border border-gold-primary/20 bg-bg-card" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Certificate Requests List ────────────────────────────────────────────────
function CertificateRequestsList({ requests, employees, onBack, onAccept, onReject }: {
  requests: any[];
  employees: Employee[];
  onBack: () => void;
  onAccept: (req: any, emp: Employee) => void;
  onReject: (req: any) => void;
}) {
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 text-text-muted hover:text-gold-primary hover:bg-gold-primary/5 rounded-lg transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="font-orbitron font-bold text-xl text-text-primary">Certificate Requests</h2>
          <p className="text-xs text-text-muted mt-0.5">{pendingRequests.length} pending requests</p>
        </div>
      </div>

      <div className="bg-bg-card border border-gold-primary/10 rounded-2xl overflow-hidden">
        {pendingRequests.length === 0 ? (
          <div className="py-20 text-center">
            <Award size={40} className="mx-auto mb-4 text-text-muted opacity-30" />
            <p className="text-text-muted text-sm font-rajdhani">No pending certificate requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-gold-primary/5">
            {pendingRequests.map(req => {
              const emp = employees.find(e => e.employee_id === req.employee_id);
              return (
                <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-bg-surface/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center text-gold-primary font-bold">
                      {req.employee_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-rajdhani font-bold text-text-primary text-base">{req.employee_name} <span className="text-text-muted text-sm font-normal">({req.employee_id})</span></h4>
                      <p className="text-sm text-gold-primary mt-1 font-semibold">{req.certificate_title}</p>
                      <p className="text-xs text-text-muted mt-0.5">Type: {req.certificate_type}</p>
                      {req.reason && <p className="text-xs text-text-muted mt-2 italic border-l-2 border-gold-primary/30 pl-2">"{req.reason}"</p>}
                      <p className="text-[10px] text-text-muted mt-2">Requested on: {new Date(req.timestamp).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => onReject(req)} className="px-4 py-2 text-xs font-bold font-rajdhani text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors">
                      Reject
                    </button>
                    {emp ? (
                      <button onClick={() => onAccept(req, emp)} className="px-4 py-2 text-xs font-bold font-rajdhani text-black bg-gold-primary hover:bg-gold-light rounded-lg transition-colors flex items-center gap-2">
                        <CheckCircle size={14} /> Accept & Issue
                      </button>
                    ) : (
                      <span className="text-xs text-red-400 italic">Employee not found</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Employee Module ─────────────────────────────────────────────────────
export default function EmployeeModule() {
  const [view, setView] = useState<View>('list');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [certModalFor, setCertModalFor] = useState<{employee: Employee, title?: string, type?: string, reqId?: string} | null>(null);
  const [idCardModalFor, setIdCardModalFor] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleSwitch = (e: any) => setView(e.detail);
    document.addEventListener('switch-view', handleSwitch);
    return () => document.removeEventListener('switch-view', handleSwitch);
  }, []);

  // Load data from Firebase
  useEffect(() => {
    setIsLoading(true);
    const unsubs: (() => void)[] = [];

    const empUnsub = onValue(ref(db, 'employees'), snap => {
      const data = snap.val();
      if (data) {
        setEmployees(Object.entries(data).map(([id, v]: any) => ({ id, ...v })));
      } else {
        setEmployees([]);
      }
      setIsLoading(false);
    });

    const certUnsub = onValue(ref(db, 'certificates'), snap => {
      const data = snap.val();
      if (data) {
        setCertificates(Object.entries(data).map(([id, v]: any) => ({ id, ...v })));
      } else {
        setCertificates([]);
      }
    });

    const reqUnsub = onValue(ref(db, 'certificate_requests'), snap => {
      const data = snap.val();
      if (data) {
        setRequests(Object.entries(data).map(([id, v]: any) => ({ id, ...v })));
      } else {
        setRequests([]);
      }
    });

    return () => { empUnsub(); certUnsub(); reqUnsub(); };
  }, []);

  const handleSaveEmployee = async (data: Omit<Employee, 'id'>) => {
    if (view === 'edit' && selectedEmployee) {
      const updatedData = { ...data, password: selectedEmployee.password || 'kalvixnexus' };
      await set(ref(db, `employees/${selectedEmployee.id}`), updatedData);
    } else {
      const newData = { ...data, password: 'kalvixnexus' };
      await push(ref(db, 'employees'), newData);
    }
    setView('list');
    setSelectedEmployee(null);
  };

  const handleResetPassword = async (emp: Employee) => {
    if (!confirm(`Reset password for ${emp.name} to 'kalvixnexus'?`)) return;
    await set(ref(db, `employees/${emp.id}/password`), 'kalvixnexus');
    alert('Password reset successfully.');
  };

  const handleToggleStatus = async (emp: Employee) => {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    if (!confirm(`Are you sure you want to mark ${emp.name} as ${newStatus}?`)) return;
    await update(ref(db, `employees/${emp.id}`), { status: newStatus });
    if (selectedEmployee?.id === emp.id) {
      setSelectedEmployee({ ...emp, status: newStatus });
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Delete employee "${emp.name}"? This cannot be undone.`)) return;
    
    // Delete profile photo from Cloudinary if it exists
    if (emp.profile_photo) {
      try {
        await deleteImageFromCloudinary(emp.profile_photo);
      } catch (err) {
        console.error('Failed to delete profile photo from Cloudinary:', err);
      }
    }
    
    await remove(ref(db, `employees/${emp.id}`));
    if (view === 'profile') setView('list');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-gold-primary" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Certificate Generation Modal */}
      {certModalFor && (
        <CertModal
          employee={certModalFor.employee}
          initialTitle={certModalFor.title}
          initialType={certModalFor.type}
          requestId={certModalFor.reqId}
          onClose={() => setCertModalFor(null)}
          onIssued={() => setCertModalFor(null)}
        />
      )}

      {/* ID Card Generation Modal */}
      {idCardModalFor && (
        <IdCardModal
          employee={idCardModalFor}
          onClose={() => setIdCardModalFor(null)}
        />
      )}

      {/* Views */}
      {view === 'list' && (
        <EmployeeList
          employees={employees}
          onAdd={() => { setSelectedEmployee(null); setView('add'); }}
          onView={emp => { setSelectedEmployee(emp); setView('profile'); }}
          onEdit={emp => { setSelectedEmployee(emp); setView('edit'); }}
          onDelete={handleDelete}
          onIssueCert={emp => setCertModalFor({employee: emp})}
          onGenerateIdCard={emp => setIdCardModalFor(emp)}
        />
      )}

      {(view === 'add' || view === 'edit') && (
        <EmployeeForm
          initial={view === 'edit' ? selectedEmployee ?? undefined : undefined}
          onSave={handleSaveEmployee}
          onCancel={() => { setView('list'); setSelectedEmployee(null); }}
          employees={employees}
        />
      )}

      {view === 'profile' && selectedEmployee && (
        <EmployeeProfile
          employee={selectedEmployee}
          certificates={certificates}
          onBack={() => { setView('list'); setSelectedEmployee(null); }}
          onEdit={() => setView('edit')}
          onIssueCert={() => setCertModalFor({employee: selectedEmployee})}
          onDelete={() => handleDelete(selectedEmployee)}
          onResetPassword={() => handleResetPassword(selectedEmployee)}
          onToggleStatus={() => handleToggleStatus(selectedEmployee)}
        />
      )}

      {view === 'requests' && (
        <CertificateRequestsList
          requests={requests}
          employees={employees}
          onBack={() => setView('list')}
          onReject={async (req) => {
            if (confirm('Reject this certificate request?')) {
              await update(ref(db, `certificate_requests/${req.id}`), { status: 'rejected' });
            }
          }}
          onAccept={(req, emp) => {
            setCertModalFor({
              employee: emp,
              title: req.certificate_title,
              type: req.certificate_type,
              reqId: req.id
            });
          }}
        />
      )}
    </div>
  );
}
