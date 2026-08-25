import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';

export interface CertEmployee {
  name: string;
  employee_id: string;
  designation?: string;
  department?: string;
  project?: string;
  joining_date?: string;
}

export function formatInternId(empId: string, joiningDate?: string): string {
  if (!empId) return '';
  if (empId.includes('/')) return empId;
  
  const match = empId.match(/KNX(\d+)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    const year = joiningDate ? new Date(joiningDate).getFullYear() : 2026;
    return `KNX/INT/${year}/${String(num).padStart(2, '0')}`;
  }
  
  return empId;
}

export const resizeImageBase64 = (dataUrl: string, maxWidth: number = 300): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png', 0.8));
    };
    img.src = dataUrl;
  });
};

export const getCertificateAssets = async () => {
  let logoDataUrl = '';
  let stampDataUrl = '';
  let ceoSignatureDataUrl = '';
  let ctoSignatureDataUrl = '';
  
  // Fetch logo
  try {
    const response = await fetch('/logo.png');
    if (response.ok) {
      const blob = await response.blob();
      logoDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }
  } catch(e){}

  // Fetch stamp from Firebase
  try {
    const stampSnapshot = await get(ref(db, 'branding/stamp'));
    if (stampSnapshot.exists()) {
      stampDataUrl = stampSnapshot.val();
    } else {
      const stampSnapshot2 = await get(ref(db, 'stamp'));
      if (stampSnapshot2.exists()) {
        stampDataUrl = stampSnapshot2.val();
      }
    }
  } catch(e){}

  if (!stampDataUrl) {
    try {
      const response = await fetch('/stamp.png');
      if (response.ok) {
        const blob = await response.blob();
        stampDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    } catch(e){}
  }

  let ceoName = 'Shourya Sharma';
  let ceoRole = 'FOUNDER AND CEO';
  let ctoName = 'Vikram Singh Parmar';
  let ctoRole = 'CO-FOUNDER & CTO';

  // Fetch team from Firebase
  try {
    const teamSnapshot = await get(ref(db, 'team'));
    if (teamSnapshot.exists()) {
      const teamData = teamSnapshot.val();
      if (teamData.t1) {
        ceoName = teamData.t1.name || ceoName;
        ceoRole = (teamData.t1.role || ceoRole).toUpperCase();
        ceoSignatureDataUrl = teamData.t1.signature || ceoSignatureDataUrl;
      }
      if (teamData.t2) {
        ctoName = teamData.t2.name || ctoName;
        ctoRole = (teamData.t2.role || ctoRole).toUpperCase();
        ctoSignatureDataUrl = teamData.t2.signature || ctoSignatureDataUrl;
      }
    }
  } catch(e){}

  // Fallbacks
  if (!ctoSignatureDataUrl) {
    try {
      const sigResponse = await fetch('/signature-cto.png');
      if (sigResponse.ok) {
        const blob = await sigResponse.blob();
        ctoSignatureDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    } catch(e){}
  }

  if (!ceoSignatureDataUrl) {
    try {
      const sigResponse = await fetch('/signature-ceo.png');
      if (sigResponse.ok) {
        const blob = await sigResponse.blob();
        ceoSignatureDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    } catch(e){}
  }

  // Resize
  if (stampDataUrl) stampDataUrl = await resizeImageBase64(stampDataUrl);
  if (ceoSignatureDataUrl) ceoSignatureDataUrl = await resizeImageBase64(ceoSignatureDataUrl);
  if (ctoSignatureDataUrl) ctoSignatureDataUrl = await resizeImageBase64(ctoSignatureDataUrl);

  return { logoDataUrl, stampDataUrl, ceoSignatureDataUrl, ctoSignatureDataUrl, ceoName, ceoRole, ctoName, ctoRole };
};

export const generateCertificatePDF = async (
  employee: CertEmployee,
  _certId: string,
  certTitle: string,
  certType: string,
  issueDate: string,
  _issuedBy: string,
  qrDataUrl?: string,
  logoDataUrl?: string,
  stampDataUrl?: string,
  ceoSignatureDataUrl?: string,
  ctoSignatureDataUrl?: string,
  ceoName?: string,
  ceoRole?: string,
  ctoName?: string,
  ctoRole?: string
) => {
  const finalCeoName = ceoName || 'Shourya Sharma';
  const finalCeoRole = ceoRole || 'FOUNDER & CEO';
  const finalCtoName = ctoName || 'Vikram Singh Parmar';
  const finalCtoRole = ctoRole || 'CO-FOUNDER & CTO';
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Helper to generate elegant cursive text using HTML Canvas (embedded as PNG)
  const generateCursiveImage = (text: string, color = '#D4AF37', fontSize = 52): string => {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8; // Bold and smooth script
      ctx.font = `italic bold ${fontSize}px "Brush Script MT", "Lucida Handwriting", cursive, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 400, 75);
      ctx.strokeText(text, 400, 75);
      return canvas.toDataURL('image/png');
    }
    return '';
  };

  // Quadratic Bezier curve points helper to draw smooth waves
  const getBezierPoints = (p0: [number, number], p1: [number, number], p2: [number, number], steps = 15): [number, number][] => {
    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
      const y = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
      points.push([x, y]);
    }
    return points;
  };

  const W = 297, H = 210;

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // Corner Designs (Double-Layer Curving Waves - Exact replica of reference)
  // Top-Right Corner: Outer Wave
  doc.setFillColor(212, 175, 55); // Gold border
  let pts = getBezierPoints([W - 55, 0], [W, 0], [W, 55]);
  doc.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => doc.lineTo(p[0], p[1]));
  doc.lineTo(W, 0);
  doc.fill();

  doc.setFillColor(15, 15, 15); // Black corner
  pts = getBezierPoints([W - 48, 0], [W, 0], [W, 48]);
  doc.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => doc.lineTo(p[0], p[1]));
  doc.lineTo(W, 0);
  doc.fill();

  // Top-Right Corner: Inner Wave (separated by white gap)
  doc.setFillColor(212, 175, 55); // Gold line
  pts = getBezierPoints([W - 90, 0], [W, 0], [W, 90]);
  doc.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => doc.lineTo(p[0], p[1]));
  doc.lineTo(W, 0);
  doc.fill();

  doc.setFillColor(15, 15, 15); // Black line
  pts = getBezierPoints([W - 85, 0], [W, 0], [W, 85]);
  doc.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => doc.lineTo(p[0], p[1]));
  doc.lineTo(W, 0);
  doc.fill();

  doc.setFillColor(255, 255, 255); // White gap mask
  pts = getBezierPoints([W - 78, 0], [W, 0], [W, 78]);
  doc.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => doc.lineTo(p[0], p[1]));
  doc.lineTo(W, 0);
  doc.fill();


  // Bottom-Left Corner: Outer Wave
  doc.setFillColor(212, 175, 55); // Gold border
  pts = getBezierPoints([0, H - 55], [0, H], [55, H]);
  doc.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => doc.lineTo(p[0], p[1]));
  doc.lineTo(0, H);
  doc.fill();

  doc.setFillColor(15, 15, 15); // Black corner
  pts = getBezierPoints([0, H - 48], [0, H], [48, H]);
  doc.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => doc.lineTo(p[0], p[1]));
  doc.lineTo(0, H);
  doc.fill();

  // Bottom-Left Corner: Inner Wave (separated by white gap)
  doc.setFillColor(212, 175, 55); // Gold line
  pts = getBezierPoints([0, H - 90], [0, H], [90, H]);
  doc.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => doc.lineTo(p[0], p[1]));
  doc.lineTo(0, H);
  doc.fill();

  doc.setFillColor(15, 15, 15); // Black line
  pts = getBezierPoints([0, H - 85], [0, H], [85, H]);
  doc.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => doc.lineTo(p[0], p[1]));
  doc.lineTo(0, H);
  doc.fill();

  doc.setFillColor(255, 255, 255); // White gap mask
  pts = getBezierPoints([0, H - 78], [0, H], [78, H]);
  doc.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => doc.lineTo(p[0], p[1]));
  doc.lineTo(0, H);
  doc.fill();


  // Bottom-Right Corner Waves (Single Outer Wave)
  doc.setFillColor(212, 175, 55); // Gold wave
  pts = getBezierPoints([W - 75, H], [W, H], [W, H - 35]);
  doc.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => doc.lineTo(p[0], p[1]));
  doc.lineTo(W, H);
  doc.fill();

  doc.setFillColor(15, 15, 15); // Black wave
  pts = getBezierPoints([W - 65, H], [W, H], [W, H - 28]);
  doc.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => doc.lineTo(p[0], p[1]));
  doc.lineTo(W, H);
  doc.fill();

  // Faint Center Watermark (Kalvix Nexus Logo geometry)
  if (logoDataUrl) {
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.04 }));
    doc.addImage(logoDataUrl, 'PNG', W / 2 - 40, H / 2 - 40, 80, 80);
    doc.restoreGraphicsState();
  }

  // Top-Left QR Code & Verification Block
  if (qrDataUrl) {
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.6);
    doc.roundedRect(15, 15, 24, 24, 3, 3);
    doc.addImage(qrDataUrl, 'PNG', 16.5, 16.5, 21, 21);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(212, 175, 55);
    doc.text('VERIFY CERTIFICATE', 15, 44);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(120, 120, 120);
    doc.text('Scan the QR code or visit', 15, 48);
    doc.setFont('helvetica', 'bold');
    doc.text('kalvixnexus.com/verify', 15, 51);
    doc.setFont('helvetica', 'normal');
    doc.text('to the certificate', 15, 54);
  }

  // Certificate Header Brand logo & text
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', W / 2 - 26, 12, 12, 12);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 15, 15);
  doc.text('KALVIX', W / 2 - 10, 16.5);
  doc.text('NEXUS', W / 2 - 10, 21.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(212, 175, 55);
  doc.text('DRIVEN BY VISION, BUILT ON TRUST', W / 2, 28, { align: 'center', charSpace: 0.5 });

  // Certificate Title
  doc.setFont('times', 'bold');
  doc.setFontSize(40);
  doc.setTextColor(15, 15, 15);
  doc.text('CERTIFICATE', W / 2, 54, { align: 'center', charSpace: 1.5 });
  
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(212, 175, 55);
  doc.text(`OF ${certType.toUpperCase()}`, W / 2, 64, { align: 'center', charSpace: 3.5 });

  // Elegant decorative scroll divider
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 35, 71, W / 2 - 10, 71);
  doc.line(W / 2 + 10, 71, W / 2 + 35, 71);
  doc.setFillColor(212, 175, 55);
  doc.rect(W / 2 - 2, 69.5, 4, 3, 'F'); // center diamond
  doc.circle(W / 2 - 6, 71, 1, 'F');   // left dot
  doc.circle(W / 2 + 6, 71, 1, 'F');   // right dot
  doc.setLineWidth(0.3);
  doc.line(W / 2 - 35, 69.5, W / 2 - 35, 72.5); // left tick
  doc.line(W / 2 + 35, 69.5, W / 2 + 35, 72.5); // right tick

  // Presentation text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text('This Certificate is Proudly Presented to', W / 2, 85, { align: 'center' });

  // Employee name using canvas cursive generator (exact same cursive script style)
  const nameCursiveImg = generateCursiveImage(employee.name, '#D4AF37', 56);
  if (nameCursiveImg) {
    doc.addImage(nameCursiveImg, 'PNG', W / 2 - 60, 89, 120, 22.5);
  } else {
    doc.setFont('times', 'italic');
    doc.setFontSize(40);
    doc.setTextColor(212, 175, 55);
    doc.text(employee.name, W / 2, 102, { align: 'center' });
  }

  // Thin gold divider line below name with central diamond
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(95, 114, W - 95, 114);
  doc.setFillColor(212, 175, 55);
  doc.rect(W / 2 - 2, 112.5, 4, 3, 'F'); // diamond representation

  // Description text (exactly on a single line, matching the reference)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text(`Awarded for demonstrating exceptional professionalism, innovation, and commitment throughout the ${certTitle} Program.`, W / 2, 126, { align: 'center' });

  // Intern ID & Date Pills (Bottom Left & Right - Elegant Pill Shape)
  // Left Pill
  doc.setFillColor(254, 197, 65);
  doc.roundedRect(20, 142, 54, 12, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 15, 15);
  doc.text('CERTIFICATE ID:', 47, 146.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(_certId, 47, 151.5, { align: 'center' });

  // Right Pill
  doc.setFillColor(254, 197, 65);
  doc.roundedRect(W - 74, 142, 54, 12, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 15, 15);
  doc.text('DATE OF COMPLETION', W - 47, 146.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const formattedDate = new Date(issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  doc.text(formattedDate, W - 47, 151.5, { align: 'center' });

  // Footer row (Signatures & Seal)
  const footerY = 175;

  // Left Signature (CEO)
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 80, footerY, W / 2 - 30, footerY);
  
  const finalCeoSig = ceoSignatureDataUrl || generateCursiveImage(finalCeoName, '#0A0A0A', 48);
  if (finalCeoSig) {
    doc.addImage(finalCeoSig, 'PNG', W / 2 - 70, footerY - 17, 30, 15);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 15, 15);
  doc.text(finalCeoRole, W / 2 - 55, footerY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('KALVIX NEXUS', W / 2 - 55, footerY + 9, { align: 'center' });

  // Center Round Stamp (KALVIX NEXUS PRIVATE LIMITED)
  const sealX = W / 2;
  const sealY = footerY - 5;
  
  if (stampDataUrl) {
    doc.addImage(stampDataUrl, 'PNG', sealX - 15, sealY - 15, 30, 30);
  } else {
    // Draw premium stamp in code
    doc.setDrawColor(20, 20, 20); // stamp border
    doc.setLineWidth(0.6);
    doc.circle(sealX, sealY, 15); // Outer circle
    doc.setLineWidth(0.25);
    doc.circle(sealX, sealY, 12.5); // Inner circle
    
    // Stars inside stamp
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(20, 20, 20);
    doc.text('★', sealX - 10.5, sealY, { align: 'center' });
    doc.text('★', sealX + 10.5, sealY, { align: 'center' });

    // Curved text top & bottom
    doc.setFontSize(3.8);
    
    // "KALVIX NEXUS" along top arc
    const topText = "KALVIX NEXUS";
    for (let idx = 0; idx < topText.length; idx++) {
      const angle = -145 + idx * (110 / (topText.length - 1));
      const rad = (angle * Math.PI) / 180;
      const charX = sealX + 13.8 * Math.cos(rad);
      const charY = sealY + 13.8 * Math.sin(rad) + 0.6; // adjust baseline
      doc.text(topText[idx], charX, charY, { angle: angle + 90, align: 'center' });
    }

    // "PRIVATE LIMITED" along bottom arc
    const bottomText = "PRIVATE LIMITED";
    for (let idx = 0; idx < bottomText.length; idx++) {
      const angle = 145 - idx * (110 / (bottomText.length - 1));
      const rad = (angle * Math.PI) / 180;
      const charX = sealX + 13.8 * Math.cos(rad);
      const charY = sealY + 13.8 * Math.sin(rad) - 0.2; // adjust baseline
      doc.text(bottomText[idx], charX, charY, { angle: angle - 90, align: 'center' });
    }

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', sealX - 4.5, sealY - 4.5, 9, 9);
    }
  }

  // Right Signature (CTO/Co-Founder)
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(W / 2 + 30, footerY, W / 2 + 80, footerY);
  
  const finalCtoSig = ctoSignatureDataUrl || generateCursiveImage(finalCtoName, '#0A0A0A', 48);
  if (finalCtoSig) {
    doc.addImage(finalCtoSig, 'PNG', W / 2 + 40, footerY - 17, 30, 15);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 15, 15);
  doc.text(finalCtoRole, W / 2 + 55, footerY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('KALVIX NEXUS', W / 2 + 55, footerY + 9, { align: 'center' });

  // Bottom border verification link
  doc.setFont('times', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(15, 15, 15);
  doc.text('Verify this certificate at kalvixnexus.com/verify', W / 2, H - 12, { align: 'center' });

  return doc.output('datauristring');
};
