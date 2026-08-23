'use client';

import React, { useState, useEffect } from 'react';
import { db, ref, set, onValue } from '../../../lib/firebase';
import { Save, Plus, Trash2, Tag, List, Filter } from 'lucide-react';

export default function ShopFiltersBuilder() {
  const [allowedCategories, setAllowedCategories] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New input states
  const [newCat, setNewCat] = useState('');
  const [newIng, setNewIng] = useState('');
  const [newCon, setNewCon] = useState('');

  useEffect(() => {
    const filtersRef = ref(db, 'page_layouts/shop_filters');
    const unsubscribe = onValue(filtersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAllowedCategories(data.allowedCategories || []);
        setIngredients(data.ingredients || []);
        setConcerns(data.concerns || []);
      } else {
        // Fallbacks if never saved
        setAllowedCategories(['womens-care', 'wellness-category', 'mother-care', 'men-care', 'hair-care', 'face-and-body', 'attar-and-toners', 'baby-care-range']);
        setIngredients(['Neem', 'Jojoba', 'Sandalwood', 'Rose', 'Lavender', 'Almond', 'Grapefruit', 'Argan', 'Vitamin E']);
        setConcerns(['Dandruff', 'Hair Fall', 'Dry Skin', 'Anti-Aging', 'Acne', 'Pain Relief', 'Stress Relief', 'Glowing Skin', 'Stretch Marks']);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const filtersRef = ref(db, 'page_layouts/shop_filters');
      await set(filtersRef, {
        allowedCategories,
        ingredients,
        concerns
      });
      alert('Filters saved successfully!');
    } catch (err) {
      console.error('Failed to save filters', err);
      alert('Failed to save filters.');
    }
    setSaving(false);
  };

  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, val: string, clear: () => void) => {
    if (!val.trim()) return;
    setter(prev => [...prev, val.trim()]);
    clear();
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading filters...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-sans">Shop Page Filters</h1>
          <p className="text-xs text-gray-500 mt-1">Manage the options available in the Shop sidebar filters.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#008060] text-white hover:bg-[#006e52] px-4 py-2 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Filters'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categories */}
        <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-luxury-gold font-semibold pb-3 border-b border-gray-100">
            <List className="h-5 w-5" />
            <h3 className="font-serif">Allowed Categories</h3>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Enter the exact Category Slugs from your catalog that you want to display in the sidebar. Any missing slugs will be hidden from the shop page.
          </p>
          
          <div className="flex space-x-2">
            <input 
              type="text" 
              value={newCat} 
              onChange={e => setNewCat(e.target.value)}
              placeholder="e.g. face-and-body" 
              className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-xs font-sans focus:outline-none focus:border-luxury-gold"
            />
            <button onClick={() => addItem(setAllowedCategories, newCat, () => setNewCat(''))} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <ul className="space-y-2 mt-4">
            {allowedCategories.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded text-xs">
                <span>{item}</span>
                <button onClick={() => removeItem(setAllowedCategories, idx)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Ingredients */}
        <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-luxury-gold font-semibold pb-3 border-b border-gray-100">
            <Tag className="h-5 w-5" />
            <h3 className="font-serif">Ingredients</h3>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Manage the list of premium ingredients customers can filter by. Make sure to tag your products with these in the editor!
          </p>
          
          <div className="flex space-x-2">
            <input 
              type="text" 
              value={newIng} 
              onChange={e => setNewIng(e.target.value)}
              placeholder="e.g. Turmeric" 
              className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-xs font-sans focus:outline-none focus:border-luxury-gold"
            />
            <button onClick={() => addItem(setIngredients, newIng, () => setNewIng(''))} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <ul className="space-y-2 mt-4 max-h-96 overflow-y-auto custom-scrollbar">
            {ingredients.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded text-xs">
                <span>{item}</span>
                <button onClick={() => removeItem(setIngredients, idx)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Concerns */}
        <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-luxury-gold font-semibold pb-3 border-b border-gray-100">
            <Filter className="h-5 w-5" />
            <h3 className="font-serif">Concerns</h3>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Manage the wellness concerns customers can filter by (e.g. Dandruff, Dry Skin).
          </p>
          
          <div className="flex space-x-2">
            <input 
              type="text" 
              value={newCon} 
              onChange={e => setNewCon(e.target.value)}
              placeholder="e.g. Skin Aging" 
              className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-xs font-sans focus:outline-none focus:border-luxury-gold"
            />
            <button onClick={() => addItem(setConcerns, newCon, () => setNewCon(''))} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <ul className="space-y-2 mt-4 max-h-96 overflow-y-auto custom-scrollbar">
            {concerns.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded text-xs">
                <span>{item}</span>
                <button onClick={() => removeItem(setConcerns, idx)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
