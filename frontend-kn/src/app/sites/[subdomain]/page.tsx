import React from 'react';
import { notFound } from 'next/navigation';
import { adminFirestore, adminDatabase } from '@/lib/firebase-admin';

// This is a server component
export default async function TenantStorefront({ params }: { params: { subdomain: string } }) {
  const { subdomain } = params;

  // 1. Fetch tenant config from Firestore
  const tenantDoc = await adminFirestore.collection('tenants').doc(subdomain).get();
  
  if (!tenantDoc.exists) {
    // If the subdomain doesn't exist in our DB, show a 404
    notFound();
  }

  const storeData = tenantDoc.data()!;
  
  // 2. Fetch some products (for demo purposes)
  const productsSnapshot = await adminFirestore
    .collection('tenants')
    .doc(subdomain)
    .collection('products')
    .limit(10)
    .get();
    
    const products = productsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

  // 3. Fetch Theme Configuration from RTDB
  let themeConfig: any = null;
  if (storeData.themeId && storeData.themeId !== 'default') {
    const themeSnapshot = await adminDatabase.ref(`themes/${storeData.themeId}`).once('value');
    if (themeSnapshot.exists()) {
      themeConfig = themeSnapshot.val().config;
    }
  }

  // Fallback defaults
  const colors = themeConfig?.colors || {
    primary: '#D4AF37', // Default Gold
    background: '#0a0a0a',
    text: '#ffffff',
  };

  const cssVariables = {
    '--gold-primary': colors.primary,
    '--bg-primary': colors.background,
    '--text-primary': colors.text,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen text-text-primary" style={{ ...cssVariables, backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header className="border-b p-6 flex justify-between items-center sticky top-0 bg-black/50 backdrop-blur-md z-50" style={{ borderColor: 'var(--gold-primary)' }}>
        <h1 className="font-orbitron font-black text-2xl uppercase tracking-widest" style={{ color: 'var(--gold-primary)' }}>
          {storeData.storeName}
        </h1>
        <nav className="flex gap-6 text-sm font-bold uppercase tracking-wider text-text-muted">
          <a href="#" className="hover:text-gold-light transition-colors">Home</a>
          <a href="#" className="hover:text-gold-light transition-colors">Catalog</a>
          <a href="#" className="hover:text-gold-light transition-colors">Contact</a>
        </nav>
      </header>
      
      <main className="max-w-7xl mx-auto p-6 py-20">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black font-rajdhani mb-4">Welcome to {storeData.storeName}</h2>
          <p className="text-text-muted max-w-2xl mx-auto">This store is powered by Kalvix Nexus infrastructure. Start browsing our exclusive catalog below.</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center p-20 border border-dashed rounded-2xl bg-black/20" style={{ borderColor: 'var(--gold-primary)' }}>
            <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
            <p className="text-text-muted">The merchant is currently adding products to their catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <div key={product.id} className="bg-black/30 border rounded-xl overflow-hidden shadow-lg group transition-all duration-300 hover:scale-[1.02]" style={{ borderColor: 'var(--gold-primary)' }}>
                <div className="h-48 relative flex items-center justify-center bg-black/50">
                  {/* Placeholder for product image */}
                  <div className="text-text-muted text-xs">No Image</div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold mb-1 truncate">{product.name}</h4>
                  <div className="font-rajdhani font-black text-lg mt-1" style={{ color: 'var(--gold-primary)' }}>₹{product.price}</div>
                  <button 
                    className="w-full mt-4 bg-transparent border py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors hover:bg-white hover:text-black"
                    style={{ borderColor: 'var(--gold-primary)', color: 'var(--gold-primary)' }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <footer className="text-center p-8 border-t text-xs opacity-80" style={{ borderColor: 'var(--gold-primary)' }}>
        &copy; {new Date().getFullYear()} {storeData.storeName}. All rights reserved.<br/>
        <span className="opacity-50 text-[10px] uppercase mt-2 block">Powered by Kalvix Nexus</span>
      </footer>
    </div>
  );
}
