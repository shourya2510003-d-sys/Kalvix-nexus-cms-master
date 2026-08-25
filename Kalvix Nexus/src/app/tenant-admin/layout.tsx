'use client';

import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Store, ShoppingBag, Settings, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TenantAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const redirectHome = () => {
        const isLocal = window.location.hostname.includes('localhost');
        const mainDomain = isLocal ? 'http://localhost:3001' : 'https://kalvixnexus.com';
        window.location.href = mainDomain;
      };

      if (user) {
        // Check custom claims
        const tokenResult = await user.getIdTokenResult(true);
        if (tokenResult.claims.tenant_admin && tokenResult.claims.tenant_id) {
          setIsAdmin(true);
          setTenantId(tokenResult.claims.tenant_id as string);
        } else {
          redirectHome();
        }
      } else {
        redirectHome();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-bg-primary text-gold-primary"><Loader2 className="animate-spin" size={40} /></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex">
      {/* Sidebar */}
      <div className="w-64 bg-bg-card border-r border-gold-primary/20 flex flex-col">
        <div className="p-6 border-b border-gold-primary/20">
          <h2 className="font-orbitron font-black text-xl text-gold-primary uppercase tracking-widest flex items-center gap-2">
            <Store size={20} /> Tenant Admin
          </h2>
          <p className="text-xs text-text-muted mt-2 truncate">Store: {tenantId}.kalvixnexus.com</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/tenant-admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gold-primary/10 text-text-primary transition-colors">
            <Store size={18} className="text-gold-primary" /> Dashboard
          </Link>
          <Link href="/tenant-admin/products" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gold-primary/10 text-text-primary transition-colors">
            <ShoppingBag size={18} className="text-gold-primary" /> Products
          </Link>
          <Link href="/tenant-admin/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gold-primary/10 text-text-primary transition-colors">
            <Settings size={18} className="text-gold-primary" /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-gold-primary/20">
          <button 
            onClick={() => getAuth(app).signOut()}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/10 text-red-400 w-full transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
