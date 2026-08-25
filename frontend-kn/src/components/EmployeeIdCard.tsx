'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Phone, Globe, ShieldCheck, UserSquare2, RefreshCcw } from 'lucide-react';
import QRCode from 'qrcode';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['600', '700'] });

export interface Employee {
  id?: string;
  employee_id: string;
  name: string;
  role?: string;
  designation?: string;
  department?: string;
  join_date?: string;
  joining_date?: string;
  blood_group?: string;
  status: string;
  image?: string;
  profile_photo?: string;
}

export default function EmployeeIdCard({ employee }: { employee: Employee }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [ceoSig, setCeoSig] = useState<string>('');
  const [ctoSig, setCtoSig] = useState<string>('');

  useEffect(() => {
    // Generate QR Code linking to verification page
    const verifyUrl = `https://kalvixnexus.com/verify-employee?id=${employee.employee_id}`;
    QRCode.toDataURL(verifyUrl, {
      width: 250,
      margin: 1,
      color: { dark: '#D4AF37', light: '#FFFFFF' }
    }).then(setQrCodeUrl).catch(console.error);

    // Fetch dynamic signatures from Firebase team profiles
    const fetchSigs = async () => {
      try {
        const teamSnapshot = await get(ref(db, 'team'));
        if (teamSnapshot.exists()) {
          const teamData = teamSnapshot.val();
          Object.values(teamData).forEach((member: any) => {
            if (member.name && member.name.includes('Shourya') && member.signature) {
              setCeoSig(member.signature);
            }
            if (member.name && (member.name.includes('Vikram') || member.role?.toUpperCase().includes('CTO') || member.role?.toUpperCase().includes('CO-FOUNDER')) && member.signature) {
              setCtoSig(member.signature);
            }
          });
        }
      } catch (err) {
        console.error('Failed to fetch signatures for ID Card', err);
      }
    };
    fetchSigs();
  }, [employee.employee_id]);

  return (
    <div className="relative group w-[340px] h-[520px] [perspective:1000px] mx-auto select-none">
      
      {/* Flip Button */}
      <button 
        onClick={() => setIsFlipped(!isFlipped)}
        className="absolute -right-4 -top-4 z-20 bg-bg-surface border border-gold-primary/50 text-gold-primary p-2 rounded-full shadow-lg hover:bg-gold-primary hover:text-black transition-all duration-300"
        title="Flip Card"
      >
        <RefreshCcw size={16} />
      </button>

      {/* 3D Container */}
      <div 
        className={`w-full h-full transition-all duration-700 [transform-style:preserve-3d] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        
        {/* ======================= FRONT SIDE ======================= */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-[#111111] rounded-2xl overflow-hidden flex flex-col items-center">
          
          {/* White Background SVG with Gold Border */}
          <svg className="absolute top-0 left-0 w-full h-[62%] z-0" viewBox="0 0 340 322" preserveAspectRatio="none" fill="none">
            <path d="M0 0 H340 V230 L170 322 L0 230 Z" fill="#F5F5F5" />
            <path d="M0 230 L170 322 L340 230" stroke="#D4AF37" strokeWidth="2.5" />
          </svg>

          {/* Front Content */}
          <div className="relative z-10 flex flex-col items-center w-full h-full pt-5 pb-5">
            
            {/* Header: Logo & Branding */}
            <div className="flex flex-col items-center mb-2">
              <div className="relative mb-1" style={{ width: '72px', height: '72px' }}>
                <Image src="/logo.png" alt="Kalvix Nexus Logo" fill className="object-contain" />
              </div>
              <h1 className="font-orbitron font-black text-lg text-black tracking-wider uppercase leading-none">Kalvix Nexus</h1>
              <p className="font-rajdhani font-bold text-[9px] text-gold-primary tracking-widest uppercase mt-1 text-center leading-tight">
                Driven by Vision,<br/>Built on Trust
              </p>
            </div>

            {/* Hexagon Photo (Fixed dimensions to prevent stretching) */}
            <div className="relative flex-shrink-0 mb-2" style={{ width: '155px', height: '165px', marginTop: '8px' }}>
              {/* Gold Border Hexagon */}
              <div 
                className="absolute inset-0 bg-gold-primary"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              />
              {/* Inner Photo Hexagon */}
              <div 
                className="absolute inset-[3px] bg-bg-surface overflow-hidden"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              >
                <Image 
                  src={employee.profile_photo || employee.image || '/logo.png'} 
                  alt={employee.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Employee Info */}
            <div className="flex flex-col items-center w-full flex-1 justify-center">
              <h2 className={`${playfair.className} font-semibold text-[22px] text-gold-primary tracking-wide px-4 text-center mb-1`}>
                {employee.name}
              </h2>
              {/* Star-decorated name underline separator */}
              <div className="flex items-center justify-center gap-1.5 w-32 mb-1.5">
                <div className="h-[1px] bg-gold-primary flex-1" />
                <span className="text-gold-primary text-[8px] leading-none">★</span>
                <div className="h-[1px] bg-gold-primary flex-1" />
              </div>
              <p className="font-inter font-semibold text-[14px] text-white tracking-wide px-4 text-center">
                ({employee.designation || employee.role || 'Team Member'})
              </p>

              {/* Gold separator */}
              <div className="w-24 h-[1px] bg-gold-primary/30 my-1.5" />

              <div className="flex flex-col items-center">
                <span className="font-rajdhani font-bold text-[10px] text-gold-primary tracking-[0.3em] uppercase mb-0.5">
                  Employee ID
                </span>
                <span className="font-mono font-bold text-base text-white">
                  {employee.employee_id}
                </span>
              </div>

              {/* Gold separator */}
              <div className="w-16 h-[1px] bg-gold-primary/30 my-1" />

              <div className="font-orbitron font-bold text-xs tracking-[0.2em] uppercase">
                <span className="text-gold-primary">Status : </span>
                <span className="text-white">{employee.status === 'active' || employee.status === 'Active' ? 'Active' : 'Former'}</span>
              </div>
            </div>

          </div>
        </div>

        {/* ======================= BACK SIDE ======================= */}
        <div 
          className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#111111] rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Light Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.1]">
            <div className="relative w-72 h-72">
              <Image src="/logo.png" alt="Watermark" fill className="object-contain filter grayscale" />
            </div>
          </div>

          {/* Top Line & Header */}
          <div className="pt-6 pb-2 flex flex-col items-center flex-shrink-0">
            <div className="w-[60px] h-[60px] relative mb-1.5">
              <Image src="/logo.png" alt="Kalvix Nexus Logo" fill className="object-contain" />
            </div>
            <h1 className="font-orbitron font-bold text-lg text-white tracking-wider uppercase leading-none">Kalvix Nexus</h1>
            <p className="font-rajdhani font-bold text-[8.5px] text-gold-primary tracking-widest uppercase mt-0.5 text-center leading-tight">
              Driven by Vision, Built on Trust
            </p>
          </div>

          {/* V-Shaped Gold Line Divider (matching reference curves style on black background) */}
          <svg className="w-full h-4 my-1 pointer-events-none flex-shrink-0" viewBox="0 0 340 16" fill="none">
            <path d="M0 2 L170 14 L340 2" stroke="#D4AF37" strokeWidth="2.5" />
          </svg>

          {/* Terms & QR Section */}
          <div className="flex-1 flex px-5 py-4 gap-4">
            
            {/* Icons and Text (Left Column) */}
            <div className="flex flex-col gap-5 flex-1 pr-2">
              
              <div className="flex items-start gap-3">
                <div className="text-gold-primary mt-0.5"><UserSquare2 size={20} strokeWidth={1.5} /></div>
                <p className="text-[9px] text-white/80 font-inter leading-tight text-left">
                  This card certifies that the individual is an authorised representative of Kalvix Nexus.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-gold-primary mt-0.5"><ShieldCheck size={20} strokeWidth={1.5} /></div>
                <p className="text-[9px] text-white/80 font-inter leading-tight text-left">
                  This card is non-transferable and is the property of Kalvix Nexus.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-gold-primary mt-0.5"><Phone size={20} strokeWidth={1.5} /></div>
                <p className="text-[9px] text-white/80 font-inter leading-tight text-left">
                  In case of loss, please contact<br/>
                  <span className="text-white">+91 7906355122</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-gold-primary"><Globe size={20} strokeWidth={1.5} /></div>
                <p className="text-[9px] text-white/80 font-inter text-left">
                  www.kalvixnexus.com
                </p>
              </div>
            </div>

            {/* QR Code (Right Column) */}
            <div className="w-28 flex flex-col items-center justify-center pt-2">
              <div className="bg-white p-1.5 rounded-xl shadow-lg border-2 border-gold-primary">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Verify QR" className="w-full h-full" />
                ) : (
                  <div className="w-[96px] h-[96px] bg-gray-200 animate-pulse" />
                )}
              </div>
              <span className="font-rajdhani font-bold text-[10px] text-gold-primary tracking-widest uppercase mt-3 text-center w-full">
                Scan To Verify
              </span>
            </div>

          </div>

          {/* Footer Divider */}
          <div className="w-full h-[1.5px] bg-gold-primary mt-auto flex-shrink-0" />
          
          <div className="px-6 py-4 pb-6 flex items-end justify-between relative overflow-hidden">
            {/* Left Sign - Shourya Sharma */}
            <div className="flex flex-col relative z-10 w-[45%]">
              <div className="h-10 flex items-end justify-center mb-1">
                {ceoSig ? (
                  <img src={ceoSig} alt="CEO Signature" className="max-h-full object-contain filter invert brightness-150" />
                ) : (
                  <div className="font-script text-xl text-white/90 -rotate-2">Shourya Sharma</div>
                )}
              </div>
              <div className="w-full h-[1px] bg-gold-primary/60 mb-1" />
              <div className="font-rajdhani font-bold text-gold-primary tracking-wider text-[9px] uppercase text-center">
                Shourya Sharma
              </div>
              <div className="font-inter text-[8px] text-white/70 text-center leading-none">
                Co-Founder & CEO
              </div>
            </div>

            {/* Right Sign - Vikram Singh Parmar */}
            <div className="flex flex-col relative z-10 w-[45%]">
              <div className="h-10 flex items-end justify-center mb-1">
                {ctoSig ? (
                  <img src={ctoSig} alt="Co-Founder Signature" className="max-h-full object-contain filter invert brightness-150" />
                ) : (
                  <div className="font-script text-xl text-white/90 -rotate-2">Vikram Singh</div>
                )}
              </div>
              <div className="w-full h-[1px] bg-gold-primary/60 mb-1" />
              <div className="font-rajdhani font-bold text-gold-primary tracking-wider text-[9px] uppercase text-center">
                Vikram Singh Parmar
              </div>
              <div className="font-inter text-[8px] text-white/70 text-center leading-none">
                Co-Founder & CTO
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
