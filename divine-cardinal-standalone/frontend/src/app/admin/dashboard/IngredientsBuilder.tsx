'use client';

import React, { useState, useEffect } from 'react';
import { db, ref, set, onValue } from '../../../lib/firebase';
import { Save, Plus, Trash2, Search, Edit2, X, PlusCircle, BookOpen } from 'lucide-react';
import { INGREDIENT_DICTIONARY } from '../../../lib/ingredients';

export default function IngredientsBuilder() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Search and selection states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<any | null>(null);
  
  // Form states for adding/editing an ingredient
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    id: '',
    name: '',
    type: 'Essential Oil',
    description: '',
    image: '',
    benefits: [],
    historicalSignificance: '',
    products: [],
    // New Fields
    heroImage: '',
    sku: '',
    femaNumber: '',
    casNumber: '',
    category: '',
    botanicalName: '',
    plantParts: '',
    extractionMethod: '',
    history: '',
    therapeuticProperties: '',
    specifications: [],
    faqs: []
  });
  
  // Temp states for lists
  const [newBenefit, setNewBenefit] = useState('');
  const [selectedProductSku, setSelectedProductSku] = useState('');
  
  // Temp states for complex lists
  const [newSpec, setNewSpec] = useState({ label: '', value: '' });
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  useEffect(() => {
    // 1. Fetch Ingredients from dynamic DB config
    const unsubIngredients = onValue(ref(db, 'ingredients'), (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (Array.isArray(val)) {
          setIngredients(val);
        } else if (val && typeof val === 'object') {
          setIngredients(Object.values(val));
        }
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    // 2. Fetch Products to allow mapping dropdowns
    const unsubProducts = onValue(ref(db, 'products'), (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (Array.isArray(val)) {
          setProductsList(val);
        } else if (val && typeof val === 'object') {
          setProductsList(Object.values(val));
        }
      }
    });

    const timeout = setTimeout(() => {
      setLoading(false);
      setIngredients(prev => prev && prev.length > 0 ? prev : INGREDIENT_DICTIONARY);
    }, 2500);

    return () => {
      unsubIngredients();
      unsubProducts();
      clearTimeout(timeout);
    };
  }, []);

  const handleSave = async (updatedIngredients = ingredients) => {
    setSaving(true);
    try {
      await set(ref(db, 'ingredients'), updatedIngredients);
      alert('Ingredients glossary updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save ingredients configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditIngredient = (ing: any) => {
    setSelectedIngredient(ing);
    setEditForm({
      id: ing.id || '',
      name: ing.name || '',
      type: ing.type || 'Essential Oil',
      description: ing.description || '',
      image: ing.image || '',
      benefits: Array.isArray(ing.benefits) ? [...ing.benefits] : [],
      historicalSignificance: ing.historicalSignificance || '',
      products: Array.isArray(ing.products) ? [...ing.products] : [],
      // New fields
      heroImage: ing.heroImage || '',
      sku: ing.sku || '',
      femaNumber: ing.femaNumber || '',
      casNumber: ing.casNumber || '',
      category: ing.category || '',
      botanicalName: ing.botanicalName || '',
      plantParts: ing.plantParts || '',
      extractionMethod: ing.extractionMethod || '',
      history: ing.history || '',
      therapeuticProperties: ing.therapeuticProperties || '',
      specifications: Array.isArray(ing.specifications) ? [...ing.specifications] : [],
      faqs: Array.isArray(ing.faqs) ? [...ing.faqs] : []
    });
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setSelectedIngredient(null);
    setEditForm({
      id: `ing-${Date.now()}`,
      name: 'New Ingredient',
      type: 'Essential Oil',
      description: '',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=300',
      benefits: ['Nourishing', 'Soothing'],
      historicalSignificance: '',
      products: [],
      // New fields
      heroImage: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1200',
      sku: 'SKU-NEW',
      femaNumber: '',
      casNumber: '',
      category: 'Pure Essential Oils',
      botanicalName: '',
      plantParts: '',
      extractionMethod: '',
      history: '',
      therapeuticProperties: '',
      specifications: [],
      faqs: []
    });
    setIsEditing(true);
  };

  const handleFormSave = () => {
    if (!editForm.name.trim()) {
      alert("Name is required!");
      return;
    }
    
    // Ensure slug-like ID if it's new
    let finalId = editForm.id;
    if (!selectedIngredient) {
      finalId = editForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      // Check for duplicate ID
      if (ingredients.some(i => i.id === finalId)) {
        finalId = `${finalId}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updatedItem = {
      ...editForm,
      id: finalId
    };

    let newIngredients;
    if (selectedIngredient) {
      // Edit mode
      newIngredients = ingredients.map(i => i.id === selectedIngredient.id ? updatedItem : i);
    } else {
      // Add mode
      newIngredients = [...ingredients, updatedItem];
    }

    setIngredients(newIngredients);
    setIsEditing(false);
    setSelectedIngredient(null);
    
    // Auto-save changes to DB
    handleSave(newIngredients);
  };

  const handleDeleteIngredient = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      const newIngredients = ingredients.filter(i => i.id !== id);
      setIngredients(newIngredients);
      if (selectedIngredient?.id === id) {
        setIsEditing(false);
        setSelectedIngredient(null);
      }
      handleSave(newIngredients);
    }
  };

  // List management helpers
  const handleAddBenefit = () => {
    if (newBenefit.trim() && !editForm.benefits.includes(newBenefit.trim())) {
      setEditForm({
        ...editForm,
        benefits: [...editForm.benefits, newBenefit.trim()]
      });
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (b: string) => {
    setEditForm({
      ...editForm,
      benefits: editForm.benefits.filter((item: string) => item !== b)
    });
  };

  const handleAddProduct = () => {
    if (!selectedProductSku) return;
    const prod = productsList.find(p => p.sku === selectedProductSku || p.id === selectedProductSku);
    if (!prod) return;
    
    // Check if product already mapped
    const exists = editForm.products.some((p: any) => p.sku === prod.sku || p.sku === prod.id);
    if (exists) {
      alert("Product is already mapped to this ingredient.");
      return;
    }

    const newProdMap = {
      sku: prod.sku || prod.id,
      name: prod.name
    };

    setEditForm({
      ...editForm,
      products: [...editForm.products, newProdMap]
    });
    setSelectedProductSku('');
  };

  const handleRemoveProduct = (sku: string) => {
    setEditForm({
      ...editForm,
      products: editForm.products.filter((p: any) => p.sku !== sku)
    });
  };

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeroImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
      const res = await fetch(`${API_URL}/cms/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setEditForm((prev: any) => ({ ...prev, heroImage: data.url }));
    } catch (err) {
      console.error('Error uploading hero image:', err);
      alert('Failed to upload hero image. Please try again.');
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
      const res = await fetch(`${API_URL}/cms/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      
      setEditForm({
        ...editForm,
        image: data.url
      });
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Filtered ingredients list
  const filteredIngredients = ingredients.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (i.type && i.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Ingredients Glossary Data...</div>;

  return (
    <div className="space-y-6 text-left pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-300 pb-4 gap-4 sticky top-0 bg-[#F1F1F1] z-10 py-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#1A1A1A]">Ingredients Glossary Builder</h1>
          <p className="text-xs text-gray-500 mt-1">Manage Ayurvedic ingredients list, upload images, edit benefits, and map products dynamically.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleCreateNew}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Ingredient</span>
          </button>
          <button 
            onClick={() => handleSave()}
            disabled={saving}
            className="bg-[#008060] hover:bg-[#006e52] text-white px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider shadow flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Config'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ingredients List */}
        <div className="lg:col-span-1 bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col h-[650px]">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search glossary..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#CCCCCC] focus:outline-none focus:border-luxury-gold rounded-md pl-9 pr-4 py-1.5 text-xs text-[#303030] placeholder-gray-400"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 pr-1">
            {filteredIngredients.map(ing => (
              <div 
                key={ing.id} 
                onClick={() => handleEditIngredient(ing)}
                className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between rounded transition-colors ${selectedIngredient?.id === ing.id ? 'bg-luxury-gold/10 hover:bg-luxury-gold/10' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                    <img src={ing.image || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=100'} alt={ing.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#1A1A1A]">{ing.name}</h4>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest block mt-0.5">{ing.type || 'Essential Oil'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {Array.isArray(ing.products) ? ing.products.length : 0} Prods
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteIngredient(ing.id, ing.name); }}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredIngredients.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-xs">No ingredients found matching search.</div>
            )}
          </div>
        </div>

        {/* Right Column: Editor Form */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <h3 className="font-serif text-base font-bold text-[#1A1A1A]">
                  {selectedIngredient ? `Edit: ${selectedIngredient.name}` : 'Create New Ingredient'}
                </h3>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Ingredient Name</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded p-2 text-xs"
                    placeholder="e.g. Lavender Oil"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Ingredient Type</label>
                  <select 
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full border border-gray-300 rounded p-2 text-xs bg-white"
                  >
                    <option value="Essential Oil">Essential Oil</option>
                    <option value="Carrier Oil">Carrier Oil</option>
                    <option value="Attar/Fragrance Base">Attar/Fragrance Base</option>
                    <option value="Herb">Herb</option>
                    <option value="Botanical Distillation">Botanical Distillation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Glossary / Card Description</label>
                <textarea 
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-xs"
                  placeholder="A premium, soothing herbal remedy..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Ayurvedic / Historical Significance</label>
                <textarea 
                  rows={2}
                  value={editForm.historicalSignificance}
                  onChange={(e) => setEditForm({ ...editForm, historicalSignificance: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-xs"
                  placeholder="Traditionally used in royal baths to calm Vata elements..."
                />
              </div>

              {/* NEW ADVANCED FIELDS */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="font-bold text-sm mb-4">Advanced Ingredient Profile (For Individual Pages)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1">SKU</label>
                    <input type="text" value={editForm.sku} onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-xs" placeholder="e.g. DCI-PEO-0018" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">FEMA Number</label>
                    <input type="text" value={editForm.femaNumber} onChange={(e) => setEditForm({ ...editForm, femaNumber: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-xs" placeholder="e.g. 2466" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">CAS Number</label>
                    <input type="text" value={editForm.casNumber} onChange={(e) => setEditForm({ ...editForm, casNumber: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-xs" placeholder="e.g. 8000-48-4" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1">Category</label>
                    <input type="text" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-xs" placeholder="e.g. Pure Essential Oils" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">Botanical Name</label>
                    <input type="text" value={editForm.botanicalName} onChange={(e) => setEditForm({ ...editForm, botanicalName: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-xs" placeholder="e.g. Eucalyptus globulus" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">Plant Parts</label>
                    <input type="text" value={editForm.plantParts} onChange={(e) => setEditForm({ ...editForm, plantParts: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-xs" placeholder="e.g. Leaves and twigs" />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-semibold block mb-1">Extraction Method</label>
                  <input type="text" value={editForm.extractionMethod} onChange={(e) => setEditForm({ ...editForm, extractionMethod: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-xs" placeholder="e.g. Steam Distillation" />
                </div>
                
                <div className="mb-4">
                  <label className="text-xs font-semibold block mb-1">Hero Image</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      id="hero_img_upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleHeroImageUpload}
                    />
                    <label
                      htmlFor="hero_img_upload"
                      className={`flex items-center space-x-2 bg-[#008060] hover:bg-[#006048] text-white text-xs px-4 py-2 rounded cursor-pointer font-semibold transition-colors ${uploadingHeroImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" /></svg>
                      <span>{uploadingHeroImage ? 'Uploading...' : 'Upload Hero Image'}</span>
                    </label>
                    {editForm.heroImage && (
                      <button
                        type="button"
                        onClick={() => setEditForm((prev: any) => ({ ...prev, heroImage: '' }))}
                        className="text-xs text-red-500 hover:text-red-700 underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {editForm.heroImage && (
                    <div className="mt-3 relative w-full h-32 rounded border overflow-hidden">
                      <img src={editForm.heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold block mb-1">History & Origin</label>
                    <textarea rows={4} value={editForm.history} onChange={(e) => setEditForm({ ...editForm, history: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-xs" placeholder="Detailed history..." />
                  </div>
                  <div>
                    <label className="text-xs font-semibold block mb-1">Therapeutic Properties</label>
                    <textarea rows={4} value={editForm.therapeuticProperties} onChange={(e) => setEditForm({ ...editForm, therapeuticProperties: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-xs" placeholder="List properties..." />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold block mb-1">Image Source</label>
                  <div className="flex flex-col space-y-3">
                    <input 
                      type="file" 
                      id="ing_img_upload" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="ing_img_upload" className={`flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className="text-gray-500 font-medium">{uploadingImage ? 'Uploading...' : 'Click to upload image'}</span>
                    </label>
                    {editForm.image && (
                      <div className="relative mt-2 h-32 w-32 rounded-lg border overflow-hidden shadow-sm group">
                        <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setEditForm({ ...editForm, image: '' })} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Key Benefits (Tags)</label>
                  <div className="flex space-x-2 mb-2">
                    <input 
                      type="text" 
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddBenefit()}
                      placeholder="Add benefit..."
                      className="flex-1 border border-gray-300 rounded p-1.5 text-xs"
                    />
                    <button 
                      onClick={handleAddBenefit}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {editForm.benefits.map((b: string) => (
                      <span key={b} className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded flex items-center space-x-1">
                        <span>{b}</span>
                        <button onClick={() => handleRemoveBenefit(b)} className="text-red-500 hover:text-red-700 font-bold ml-1">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Product Cross-Referencing */}
              <div className="border-t border-gray-200 pt-4">
                <label className="text-xs font-semibold block mb-2">Products Formulated With This Ingredient</label>
                <div className="flex space-x-2 mb-4">
                  <select 
                    value={selectedProductSku}
                    onChange={(e) => setSelectedProductSku(e.target.value)}
                    className="flex-1 border border-gray-300 rounded p-1.5 text-xs bg-white"
                  >
                    <option value="">Select a Product to Map...</option>
                    {productsList.map(prod => (
                      <option key={prod.sku || prod.id} value={prod.sku || prod.id}>
                        {prod.name} ({prod.sku || 'No SKU'})
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={handleAddProduct}
                    className="bg-[#008060] hover:bg-[#006e52] text-white px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center space-x-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Map Product</span>
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded p-2">
                  {editForm.products && editForm.products.map((prod: any) => (
                    <div key={prod.sku} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-gray-800">{prod.name}</span>
                        <span className="text-[10px] text-gray-400 ml-2 font-mono">({prod.sku})</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveProduct(prod.sku)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(!editForm.products || editForm.products.length === 0) && (
                    <div className="text-center py-4 text-gray-400 text-xs">No products currently mapped to this ingredient.</div>
                  )}
                </div>
              </div>

              {/* Specifications Array */}
              <div className="border-t border-gray-200 pt-4">
                <label className="text-xs font-semibold block mb-2">Technical Specifications</label>
                <div className="flex space-x-2 mb-2">
                  <input 
                    type="text" 
                    value={newSpec.label}
                    onChange={(e) => setNewSpec({ ...newSpec, label: e.target.value })}
                    placeholder="Label (e.g. Color)"
                    className="flex-1 border border-gray-300 rounded p-1.5 text-xs"
                  />
                  <input 
                    type="text" 
                    value={newSpec.value}
                    onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                    placeholder="Value (e.g. Pale Yellow)"
                    className="flex-1 border border-gray-300 rounded p-1.5 text-xs"
                  />
                  <button 
                    onClick={() => {
                      if(newSpec.label && newSpec.value) {
                        setEditForm({...editForm, specifications: [...editForm.specifications, newSpec]});
                        setNewSpec({label: '', value: ''});
                      }
                    }}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {editForm.specifications.map((s: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 text-xs border border-gray-200 rounded">
                      <span><strong>{s.label}:</strong> {s.value}</span>
                      <button onClick={() => setEditForm({...editForm, specifications: editForm.specifications.filter((_:any, i:number) => i !== idx)})} className="text-red-500 hover:text-red-700 font-bold ml-1">×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs Array */}
              <div className="border-t border-gray-200 pt-4">
                <label className="text-xs font-semibold block mb-2">Frequently Asked Questions</label>
                <div className="flex flex-col space-y-2 mb-2">
                  <input 
                    type="text" 
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                    placeholder="Question?"
                    className="w-full border border-gray-300 rounded p-1.5 text-xs"
                  />
                  <textarea 
                    rows={2}
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                    placeholder="Answer..."
                    className="w-full border border-gray-300 rounded p-1.5 text-xs"
                  />
                  <button 
                    onClick={() => {
                      if(newFaq.question && newFaq.answer) {
                        setEditForm({...editForm, faqs: [...editForm.faqs, newFaq]});
                        setNewFaq({question: '', answer: ''});
                      }
                    }}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs self-end"
                  >
                    Add FAQ
                  </button>
                </div>
                <div className="space-y-2 mt-2">
                  {editForm.faqs.map((f: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-2 text-xs border border-gray-200 rounded">
                      <div className="flex justify-between items-start">
                        <strong className="mb-1">{f.question}</strong>
                        <button onClick={() => setEditForm({...editForm, faqs: editForm.faqs.filter((_:any, i:number) => i !== idx)})} className="text-red-500 hover:text-red-700 font-bold ml-1">×</button>
                      </div>
                      <p className="text-gray-600">{f.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="bg-white border border-[#CCCCCC] hover:border-black text-gray-700 px-4 py-1.5 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFormSave}
                  className="bg-[#008060] hover:bg-[#006e52] text-white px-5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider"
                >
                  Apply & Save
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded border border-gray-200 shadow-sm text-center text-gray-400 h-[650px] flex flex-col justify-center items-center">
              <p className="text-sm mb-2">Select an ingredient from the left side to edit its content and product mappings.</p>
              <p className="text-xs">Or click "Add Ingredient" to create a new ingredient from scratch.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
