'use client';

import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { app, firestore } from '@/lib/firebase';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';

export default function TenantAdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', desc: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) return;
    
    const tokenResult = await user.getIdTokenResult();
    const tId = tokenResult.claims.tenant_id as string;
    setTenantId(tId);

    if (tId) {
      const coll = collection(firestore, 'tenants', tId, 'products');
      const snap = await getDocs(coll);
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    setLoading(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    try {
      const coll = collection(firestore, 'tenants', tenantId, 'products');
      await addDoc(coll, {
        name: newProduct.name,
        price: Number(newProduct.price),
        desc: newProduct.desc,
        createdAt: new Date().toISOString()
      });
      setShowModal(false);
      setNewProduct({ name: '', price: '', desc: '' });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to add product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!tenantId || !window.confirm('Delete this product?')) return;
    try {
      await deleteDoc(doc(firestore, 'tenants', tenantId, 'products', id));
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-orbitron font-black text-3xl text-text-primary uppercase tracking-wider">Products</h1>
          <p className="text-text-muted mt-1">Manage your store catalog</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gold-primary text-black font-bold px-4 py-2 rounded flex items-center gap-2 hover:bg-gold-light transition-colors"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gold-primary" size={32} /></div>
      ) : products.length === 0 ? (
        <div className="text-center p-20 border border-dashed border-gold-primary/30 rounded-2xl bg-bg-card">
          <p className="text-text-muted mb-4">You have no products yet.</p>
          <button onClick={() => setShowModal(true)} className="text-gold-primary hover:underline">Add your first product</button>
        </div>
      ) : (
        <div className="bg-bg-card border border-gold-primary/20 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-primary/50 text-text-muted text-xs uppercase tracking-wider">
                <th className="p-4 border-b border-gold-primary/20">Name</th>
                <th className="p-4 border-b border-gold-primary/20">Price</th>
                <th className="p-4 border-b border-gold-primary/20">Description</th>
                <th className="p-4 border-b border-gold-primary/20 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-gold-primary/10 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold">{p.name}</td>
                  <td className="p-4 font-rajdhani text-lg text-gold-light font-black">₹{p.price}</td>
                  <td className="p-4 text-sm text-text-muted truncate max-w-xs">{p.desc}</td>
                  <td className="p-4 flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-gold-primary/30 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-orbitron font-bold text-xl mb-4">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Product Name</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-bg-primary border border-gold-primary/30 rounded p-2 text-text-primary focus:border-gold-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Price (₹)</label>
                <input required type="number" min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-bg-primary border border-gold-primary/30 rounded p-2 text-text-primary focus:border-gold-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Description</label>
                <textarea required rows={3} value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})} className="w-full bg-bg-primary border border-gold-primary/30 rounded p-2 text-text-primary focus:border-gold-primary outline-none" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded text-text-muted hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-gold-primary text-black font-bold px-4 py-2 rounded hover:bg-gold-light transition-colors">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
