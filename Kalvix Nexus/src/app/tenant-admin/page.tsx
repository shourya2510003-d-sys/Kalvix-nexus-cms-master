'use client';

import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getCountFromServer } from 'firebase/firestore';
import { app, firestore } from '@/lib/firebase';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';

export default function TenantAdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    visitors: 0,
  });
  const [storeData, setStoreData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) return;
      
      const tokenResult = await user.getIdTokenResult();
      const tenantId = tokenResult.claims.tenant_id as string;
      if (!tenantId) return;

      // Fetch Store Info
      const docRef = doc(firestore, 'tenants', tenantId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStoreData(docSnap.data());
      }

      // Fetch stats
      const productsColl = collection(firestore, 'tenants', tenantId, 'products');
      const productsCount = await getCountFromServer(productsColl);
      
      setStats({
        products: productsCount.data().count,
        orders: 0, // Placeholder
        revenue: 0, // Placeholder
        visitors: 124, // Placeholder for analytics
      });
    };

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-orbitron font-black text-3xl text-text-primary uppercase tracking-wider">Dashboard</h1>
          <p className="text-text-muted mt-1">Welcome back, {storeData?.storeName || 'Merchant'}!</p>
        </div>
        <div className="bg-gold-primary/10 border border-gold-primary/30 px-4 py-2 rounded-lg text-sm text-gold-light font-bold">
          Plan: {storeData?.plan?.toUpperCase() || 'PRO'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Revenue" value={`₹${stats.revenue}`} icon={<DollarSign size={24} className="text-gold-primary" />} />
        <StatCard title="Total Orders" value={stats.orders} icon={<ShoppingBag size={24} className="text-gold-primary" />} />
        <StatCard title="Total Products" value={stats.products} icon={<ShoppingBag size={24} className="text-gold-primary" />} />
        <StatCard title="Unique Visitors" value={stats.visitors} icon={<Users size={24} className="text-gold-primary" />} />
      </div>

      <div className="bg-bg-card border border-gold-primary/20 rounded-xl p-6 h-96 flex items-center justify-center text-text-muted border-dashed">
        <div className="text-center">
          <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
          <p>Analytics chart will appear here once you have orders.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-bg-card border border-gold-primary/20 rounded-xl p-6 flex items-center justify-between">
      <div>
        <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
        <h3 className="font-rajdhani font-black text-3xl text-text-primary">{value}</h3>
      </div>
      <div className="w-12 h-12 bg-gold-primary/10 rounded-lg flex items-center justify-center border border-gold-primary/20">
        {icon}
      </div>
    </div>
  );
}
