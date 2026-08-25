'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Cinzel, Cormorant_Garamond, Great_Vibes, Montserrat, Poppins } from 'next/font/google';
import { Printer } from 'lucide-react';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'] });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '600', '700'] });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: ['400'] });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '600', '700'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600'] });

function CertificateContent() {
  const searchParams = useSearchParams();

  // Extract dynamic parameters (with default fallbacks)
  const candidateName = searchParams.get('name') || 'Vishakha Yadav';
  const certTitle = searchParams.get('title') || 'Engineering Internship';
  const certType = searchParams.get('type') || 'Appreciation';
  const internId = searchParams.get('id') || 'KNX/INT/2026/03';
  const issueDate = searchParams.get('date') || '28/06/2026';
  const qrCode = searchParams.get('qr') || '';
  const ceoName = searchParams.get('ceo_name') || 'Shourya Sharma';
  const ceoRole = searchParams.get('ceo_role') || 'Co-Founder & CEO';
  const ctoName = searchParams.get('cto_name') || 'Vikram Singh Parmar';
  const ctoRole = searchParams.get('cto_role') || 'Co-Founder & CTO';

  // Handle printing
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className={`min-h-screen bg-[#0E0E0E] flex flex-col items-center justify-center p-4 md:p-8 print:p-0 print:bg-white ${poppins.className}`}>
      {/* Floating Action Bar */}
      <div className="print:hidden mb-6 flex gap-3">
        <button
          onClick={handlePrint}
          className="bg-[#D4AF37] hover:bg-[#F3D06D] text-black px-6 py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-lg shadow-[#D4AF37]/10 flex items-center gap-2"
        >
          <Printer size={16} /> Print Certificate
        </button>
      </div>

      {/* A4 Landscape Certificate Canvas (DPI 300 Optimized Print Layout) */}
      <div className="relative w-full max-w-[1050px] aspect-[1.414] bg-white shadow-2xl rounded-2xl overflow-hidden print:rounded-none print:shadow-none print:w-[297mm] print:h-[210mm] print:max-w-none print:aspect-auto select-none">
        
        {/* CORNER CURVING WAVES (SVG Vector-Sharp Architecture for Pixel-Perfect Symmetry) */}
        
        {/* Top-Right Waves */}
        <div className="absolute top-0 right-0 w-[35%] h-[35%] pointer-events-none z-10">
          <svg className="w-full h-full" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Inner Gold Wave */}
            <path d="M 90,0 Q 200,80 300,220 L 300,230 Q 190,70 70,0 Z" fill="#D4AF37" />
            {/* Inner Black Wave */}
            <path d="M 100,0 Q 200,90 300,210 L 300,220 Q 195,80 80,0 Z" fill="#151515" />
            
            {/* Outer Gold Corner Wave */}
            <path d="M 150,0 Q 240,60 300,150 L 300,0 Z" fill="#D4AF37" />
            {/* Outer Black Corner Wave */}
            <path d="M 162,0 Q 248,52 300,135 L 300,0 Z" fill="#151515" />
          </svg>
        </div>

        {/* Bottom-Left Waves */}
        <div className="absolute bottom-0 left-0 w-[35%] h-[35%] pointer-events-none z-10">
          <svg className="w-full h-full" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Inner Gold Wave */}
            <path d="M 0,90 Q 80,200 220,300 L 230,300 Q 70,190 0,70 Z" fill="#D4AF37" />
            {/* Inner Black Wave */}
            <path d="M 0,100 Q 90,200 210,300 L 220,300 Q 80,195 0,80 Z" fill="#151515" />
            
            {/* Outer Gold Corner Wave */}
            <path d="M 0,150 Q 60,240 150,300 L 0,300 Z" fill="#D4AF37" />
            {/* Outer Black Corner Wave */}
            <path d="M 0,162 Q 52,248 135,300 L 0,300 Z" fill="#151515" />
          </svg>
        </div>

        {/* Bottom-Right Waves (Symmetry continuation) */}
        <div className="absolute bottom-0 right-0 w-[28%] h-[15%] pointer-events-none z-10">
          <svg className="w-full h-full" viewBox="0 0 250 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,120 Q 100,50 250,80 L 250,120 Z" fill="#D4AF37" />
            <path d="M 20,120 Q 110,60 250,90 L 250,120 Z" fill="#151515" />
          </svg>
        </div>

        {/* BACKGROUND GEOMETRIC WATERMARK (Hexagon Mandala Structure) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] z-0">
          <svg className="w-[58%] h-[58%] stroke-[#D4AF37] stroke-[0.3] fill-none" viewBox="0 0 100 100">
            <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" />
            <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" />
            <polygon points="50,25 70,36 70,64 50,75 30,64 30,36" />
            <line x1="50" y1="5" x2="50" y2="95" />
            <line x1="10" y1="28" x2="90" y2="72" />
            <line x1="10" y1="72" x2="90" y2="28" />
            <circle cx="50" cy="50" r="40" />
            <circle cx="50" cy="50" r="30" />
          </svg>
        </div>

        {/* TOP-LEFT QR CODE & VERIFICATION BOX */}
        <div className="absolute top-[8%] left-[7%] flex flex-col items-start text-left z-20">
          <div className="border-2 border-[#D4AF37]/35 rounded-2xl p-1 bg-white shadow-sm mb-2 w-24 h-24 flex items-center justify-center">
            {qrCode ? (
              <img src={qrCode} alt="QR Code" className="w-[84px] h-[84px]" />
            ) : (
              <div className="w-[84px] h-[84px] bg-[#FAF8F3] border border-[#D4AF37]/15 rounded-xl flex items-center justify-center text-[10px] text-[#D4AF37]/60 font-bold uppercase tracking-wider">
                QR Verification
              </div>
            )}
          </div>
          <p className={`${montserrat.className} font-bold text-[7px] text-[#D4AF37] tracking-[1.5px] uppercase mb-0.5`}>VERIFY CERTIFICATE</p>
          <p className="text-[6px] text-gray-400 font-medium">Scan the QR code or visit</p>
          <p className="text-[6px] text-gray-800 font-bold tracking-[0.2px]">kalvixnexus.com/verify</p>
          <p className="text-[6px] text-gray-400 font-medium">to the certificate</p>
        </div>

        {/* MAIN CERTIFICATE INNER LAYOUT */}
        <div className="absolute inset-0 flex flex-col items-center justify-between py-[7%] px-[12%] z-20 text-center">
          
          {/* Header Brand Area */}
          <div className="flex flex-col items-center mt-2 relative">
            {/* Soft gold glow around logo */}
            <div className="absolute inset-0 w-24 h-24 bg-[#D4AF37]/8 filter blur-xl rounded-full -translate-y-4" />
            <div className="w-12 h-12 flex items-center justify-center mb-1 z-10">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-[#D4AF37] stroke-[3]">
                <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" />
                <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" />
                <circle cx="50" cy="50" r="12" fill="#D4AF37" stroke="none" />
              </svg>
            </div>
            <h2 className={`${cinzel.className} text-[15px] font-bold tracking-[3px] text-[#151515]`}>KALVIX NEXUS</h2>
            <p className={`${montserrat.className} text-[5.5px] font-bold tracking-[1.5px] text-[#D4AF37] uppercase mt-0.5`}>DRIVEN BY VISION, BUILT ON TRUST</p>
          </div>

          {/* Heading Section */}
          <div className="flex flex-col items-center mt-4">
            <h1 className={`${cormorant.className} text-[44px] leading-none font-semibold tracking-[4px] text-[#151515] uppercase`}>
              Certificate
            </h1>
            <p className={`${montserrat.className} text-[13px] font-bold tracking-[12px] text-[#D4AF37] uppercase ml-[12px] mt-1.5`}>
              OF {certType}
            </p>
            {/* Elegant Ornamental Divider */}
            <div className="flex items-center justify-center gap-2.5 mt-2 w-[160px]">
              <div className="h-[0.5px] bg-[#D4AF37] flex-1" />
              <div className="w-1.5 h-1.5 bg-[#D4AF37] rotate-45 flex-shrink-0" />
              <div className="w-2.5 h-2.5 bg-[#D4AF37] rotate-45 flex-shrink-0" />
              <div className="w-1.5 h-1.5 bg-[#D4AF37] rotate-45 flex-shrink-0" />
              <div className="h-[0.5px] bg-[#D4AF37] flex-1" />
            </div>
          </div>

          {/* Recipient Section */}
          <div className="flex flex-col items-center w-full mt-4">
            <p className={`${poppins.className} text-[9.5px] font-medium text-gray-500 tracking-[0.5px]`}>
              This Certificate is Proudly Presented to
            </p>
            <h3 className={`${greatVibes.className} text-[48px] leading-tight text-[#D4AF37] py-1 select-text w-full truncate max-w-[650px] font-bold drop-shadow-[0.5px_0.5px_0.5px_rgba(212,175,55,0.2)]`}>
              {candidateName}
            </h3>
            {/* Thin gold decorative line with central diamonds */}
            <div className="flex items-center justify-center gap-2 w-[160px] -mt-1">
              <div className="h-[0.5px] bg-[#D4AF37] flex-1" />
              <div className="w-1.5 h-1.5 bg-[#D4AF37] rotate-45 flex-shrink-0" />
              <div className="h-[0.5px] bg-[#D4AF37] flex-1" />
            </div>
          </div>

          {/* Description Wording */}
          <div className="max-w-[700px] mt-2">
            <p className={`${poppins.className} text-[8.5px] text-[#444444] leading-[1.8] tracking-[0.3px]`}>
              Awarded for demonstrating exceptional professionalism, innovation, and commitment throughout the <span className="font-bold text-black">{certTitle}</span> Program.
            </p>
          </div>

          {/* Dynamic Pills (Intern ID & Date) */}
          <div className="flex items-center justify-between w-full px-6 mt-4">
            {/* Intern ID Capsule */}
            <div className="bg-[#FEC541] rounded-full px-6 py-2.5 flex flex-col items-center justify-center min-w-[130px] shadow-sm border border-white/20">
              <span className={`${montserrat.className} font-bold text-[6.5px] text-black tracking-[1.5px] uppercase mb-0.5`}>INTERN ID:</span>
              <span className={`${montserrat.className} font-extrabold text-[8.5px] text-black tracking-widest`}>{internId}</span>
            </div>

            {/* Date Capsule */}
            <div className="bg-[#FEC541] rounded-full px-6 py-2.5 flex flex-col items-center justify-center min-w-[130px] shadow-sm border border-white/20">
              <span className={`${montserrat.className} font-bold text-[6.5px] text-black tracking-[1.5px] uppercase mb-0.5`}>DATE OF COMPLETION</span>
              <span className={`${montserrat.className} font-extrabold text-[8.5px] text-black tracking-widest`}>{issueDate}</span>
            </div>
          </div>

          {/* Signatures & Company Seal Area */}
          <div className="flex items-end justify-between w-full px-[5%] mt-6 relative">
            
            {/* Left Signature: C0-Founder & CEO */}
            <div className="flex flex-col items-center text-center w-40">
              <div className="h-10 flex items-center justify-center mb-1">
                <span className={`${greatVibes.className} text-[30px] text-black select-text font-semibold`}>
                  {ceoName}
                </span>
              </div>
              <div className="w-full border-t border-[#D4AF37]/45 my-1" />
              <span className={`${montserrat.className} font-bold text-[7.5px] text-[#151515] tracking-[1px] uppercase`}>{ceoRole}</span>
              <span className={`${montserrat.className} font-medium text-[6.5px] text-gray-400 tracking-[1px] uppercase`}>KALVIX NEXUS</span>
            </div>

            {/* Center: Official Company Seal */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-8px] flex flex-col items-center justify-center w-22 h-22 rounded-full border border-black/20 p-1 bg-white shadow-sm z-30">
              <div className="absolute inset-1.5 border border-black/10 rounded-full" />
              <div className="absolute inset-2 border-2 border-black/30 rounded-full" />
              <div className="absolute inset-2.5 border border-black/10 rounded-full" />
              
              <svg className="absolute inset-0 w-full h-full rotate-[15deg]" viewBox="0 0 100 100">
                <path id="seal-text-path-top" d="M 18,50 A 32,32 0 1,1 82,50" fill="none" />
                <text className="fill-black/80 font-bold text-[6.5px] tracking-[0.5px]">
                  <textPath href="#seal-text-path-top" startOffset="50%" textAnchor="middle">
                    KALVIX NEXUS
                  </textPath>
                </text>
              </svg>
              <svg className="absolute inset-0 w-full h-full rotate-[195deg]" viewBox="0 0 100 100">
                <path id="seal-text-path-bottom" d="M 18,50 A 32,32 0 1,1 82,50" fill="none" />
                <text className="fill-black/80 font-bold text-[6.5px] tracking-[0.5px]">
                  <textPath href="#seal-text-path-bottom" startOffset="50%" textAnchor="middle">
                    PRIVATE LIMITED
                  </textPath>
                </text>
              </svg>
              
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent z-10">
                <svg viewBox="0 0 100 100" className="w-6 h-6 fill-none stroke-[#D4AF37] stroke-[3]">
                  <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" />
                  <circle cx="50" cy="50" r="10" fill="#D4AF37" stroke="none" />
                </svg>
              </div>
            </div>

            {/* Right Signature: Co-Founder */}
            <div className="flex flex-col items-center text-center w-40">
              <div className="h-10 flex items-center justify-center mb-1">
                <span className={`${greatVibes.className} text-[30px] text-black select-text font-semibold`}>
                  {ctoName}
                </span>
              </div>
              <div className="w-full border-t border-[#D4AF37]/45 my-1" />
              <span className={`${montserrat.className} font-bold text-[7.5px] text-[#151515] tracking-[1px] uppercase`}>{ctoRole}</span>
              <span className={`${montserrat.className} font-medium text-[6.5px] text-gray-400 tracking-[1px] uppercase`}>KALVIX NEXUS</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center text-[#D4AF37] font-bold tracking-widest uppercase">Loading Certificate...</div>}>
      <CertificateContent />
    </Suspense>
  );
}
