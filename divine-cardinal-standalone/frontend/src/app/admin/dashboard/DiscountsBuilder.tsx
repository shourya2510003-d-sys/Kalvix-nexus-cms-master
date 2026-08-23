'use client';

import React, { useState, useEffect } from 'react';
import { db, ref, set, onValue, remove } from '../../../lib/firebase';
import { Save, Plus, Trash2, Tag } from 'lucide-react';

export default function DiscountsBuilder() {
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState<any[]>([]);
  
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState('percentage');
  const [newValue, setNewValue] = useState('');
  const [newMinSpend, setNewMinSpend] = useState('');

  useEffect(() => {
    const discountsRef = ref(db, 'discounts');
    const unsub = onValue(discountsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setDiscounts(list);
      } else {
        setDiscounts([]);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleAddDiscount = async () => {
    if (!newCode || !newValue) {
      alert('Please provide code and discount value');
      return;
    }
    const codeId = newCode.toUpperCase().replace(/\s+/g, '');
    try {
      await set(ref(db, `discounts/${codeId}`), {
        code: codeId,
        type: newType, // percentage or fixed
        value: parseFloat(newValue),
        minSpend: newMinSpend ? parseFloat(newMinSpend) : 0,
        active: true,
        createdAt: Date.now()
      });
      setNewCode('');
      setNewValue('');
      setNewMinSpend('');
    } catch (err) {
      console.error(err);
      alert('Failed to add discount');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this discount code?')) {
      await remove(ref(db, `discounts/${id}`));
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await set(ref(db, `discounts/${id}/active`), !currentStatus);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Discounts...</div>;

  return (
    <div className="space-y-6 text-left pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-300 pb-4 gap-4 sticky top-0 bg-[#F1F1F1] z-10 py-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#1A1A1A]">Discounts & Promotions</h1>
          <p className="text-xs text-gray-500 mt-1">Manage coupon codes and promotional offers.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded border border-gray-200 shadow-sm">
        <h3 className="font-bold text-[#1A1A1A] mb-4">Create New Discount</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="text-xs font-semibold block mb-1">Coupon Code</label>
            <input 
              type="text" 
              placeholder="e.g. SUMMER10"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm uppercase"
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-xs font-semibold block mb-1">Discount Type</label>
            <select 
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:border-[#008060]"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="text-xs font-semibold block mb-1">Value</label>
            <input 
              type="number" 
              placeholder={newType === 'percentage' ? "10" : "500"}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm"
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-xs font-semibold block mb-1">Min Spend (Optional)</label>
            <input 
              type="number" 
              placeholder="e.g. 1500"
              value={newMinSpend}
              onChange={(e) => setNewMinSpend(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm"
            />
          </div>
          <div className="md:col-span-1">
            <button 
              onClick={handleAddDiscount}
              className="w-full bg-[#008060] hover:bg-[#006e52] text-white px-4 py-2 rounded text-sm font-semibold shadow flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Code</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#FAF9F6] border-b border-[#EAEAEA] text-gray-500 uppercase tracking-wider text-[10px]">
              <th className="p-4">Code</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Min Spend</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEAEA]">
            {discounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">No discounts created yet.</td>
              </tr>
            ) : (
              discounts.map((discount) => (
                <tr key={discount.id} className="hover:bg-[#FAF9F6]">
                  <td className="p-4 font-bold text-luxury-charcoal flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-luxury-gold" />
                    <span>{discount.code}</span>
                  </td>
                  <td className="p-4">
                    {discount.type === 'percentage' ? `${discount.value}% OFF` : `₹${discount.value} OFF`}
                  </td>
                  <td className="p-4 text-gray-500">
                    {discount.minSpend ? `₹${discount.minSpend}` : 'None'}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleActive(discount.id, discount.active)}
                      className={`text-[10px] uppercase px-2 py-1 rounded-full font-bold ${discount.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {discount.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(discount.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
