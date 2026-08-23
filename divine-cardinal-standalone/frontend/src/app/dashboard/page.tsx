'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, CreditCard, User, ChevronRight, FileText, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wallet'>('orders');

  useEffect(() => {
    if (token) {
      fetch(`${'https://kalvix-nexus-production.up.railway.app/api'}/orders/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          return [];
        })
        .then((data) => setOrders(data))
        .catch(console.error);
    }
  }, [token]);

  // Handle invoice download trigger
  const handleDownloadInvoice = async (orderId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${'https://kalvix-nexus-production.up.railway.app/api'}/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      alert('Could not download invoice at this time.');
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-serif text-2xl">Access Denied</h1>
        <p className="text-sm font-light text-luxury-charcoal/60">Please login to view your profile dashboard.</p>
        <Link href="/auth/login" className="inline-block bg-luxury-gold text-white px-6 py-2.5 text-xs uppercase tracking-widest font-serif">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-serif text-3xl text-luxury-charcoal mb-8 border-b border-luxury-gold/15 pb-4">
        Customer Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (Left - 3 cols) */}
        <div className="lg:col-span-3 space-y-1 bg-white border border-luxury-gold/15 p-4 shadow-sm">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between p-3 text-xs uppercase tracking-widest font-serif transition-colors ${
              activeTab === 'orders' ? 'bg-luxury-gold text-white' : 'hover:bg-luxury-cream'
            }`}
          >
            <span className="flex items-center space-x-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Order History</span>
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`w-full flex items-center justify-between p-3 text-xs uppercase tracking-widest font-serif transition-colors ${
              activeTab === 'wallet' ? 'bg-luxury-gold text-white' : 'hover:bg-luxury-cream'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span>My Wallet</span>
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between p-3 text-xs uppercase tracking-widest font-serif transition-colors ${
              activeTab === 'profile' ? 'bg-luxury-gold text-white' : 'hover:bg-luxury-cream'
            }`}
          >
            <span className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile Settings</span>
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>

          {user.role === 'ADMIN' && (
            <Link
              href="/admin/dashboard"
              className="w-full flex items-center justify-between p-3 text-xs uppercase tracking-widest font-serif text-red-700 hover:bg-red-50 transition-colors border-t border-luxury-gold/10 mt-2 pt-4"
            >
              <span className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Admin Console</span>
              </span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Content Panel (Right - 9 cols) */}
        <div className="lg:col-span-9 bg-white border border-luxury-gold/15 p-6 sm:p-8 shadow-sm min-h-[400px]">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl text-luxury-gold border-b border-luxury-gold/10 pb-2">Your Orders</h2>
              {orders.length === 0 ? (
                <p className="text-sm font-light text-luxury-charcoal/60 py-8">You have not placed any orders yet.</p>
              ) : (
                <div className="divide-y divide-luxury-gold/10">
                  {orders.map((order) => (
                    <div key={order.id} className="py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="font-serif text-base tracking-wide text-luxury-charcoal">{order.orderNumber}</h4>
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-sans ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-luxury-charcoal/50 mt-1">
                          Placed on: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-luxury-charcoal/70 mt-2 font-light">
                          Items: {order.items?.map((i: any) => `${i.name} (${i.quantity})`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="font-serif text-sm font-medium">Rs. {Number(order.totalAmount).toFixed(2)}</span>
                        <button
                          onClick={() => handleDownloadInvoice(order.id)}
                          className="flex items-center space-x-1.5 border border-luxury-gold/30 hover:border-luxury-gold text-luxury-gold hover:bg-luxury-gold/5 px-3 py-1.5 rounded text-xs transition-colors font-serif"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl text-luxury-gold border-b border-luxury-gold/10 pb-2">Kalvix Cash Wallet</h2>
              <div className="bg-luxury-cream border border-luxury-gold/15 p-6 rounded flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-luxury-charcoal/60">Available Balance</span>
                  <h3 className="font-serif text-3xl text-luxury-gold mt-1">Rs. {Number(user.walletBalance).toFixed(2)}</h3>
                </div>
                <Wallet className="h-10 w-10 text-luxury-gold/50" />
              </div>
              <p className="text-xs text-luxury-charcoal/60 leading-relaxed font-light">
                Use your wallet cash to fast-track your checkouts automatically. Wallet credits are granted on returns or via promotional coupon codes.
              </p>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl text-luxury-gold border-b border-luxury-gold/10 pb-2">Profile Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-xs text-luxury-charcoal/50 uppercase block">Full Name</span>
                  <span className="font-medium text-luxury-charcoal mt-1 block">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-luxury-charcoal/50 uppercase block">Email Address</span>
                  <span className="font-medium text-luxury-charcoal mt-1 block">{user.email}</span>
                </div>
                <div>
                  <span className="text-xs text-luxury-charcoal/50 uppercase block">Phone Number</span>
                  <span className="font-medium text-luxury-charcoal mt-1 block">{user.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-xs text-luxury-charcoal/50 uppercase block">Account Role</span>
                  <span className="font-medium text-luxury-charcoal mt-1 block uppercase text-luxury-gold">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
