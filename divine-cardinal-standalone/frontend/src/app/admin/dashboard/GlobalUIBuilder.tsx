'use client';

import React, { useState, useEffect } from 'react';
import { db, ref, set, onValue } from '../../../lib/firebase';
import { Save, Plus, Trash2, Upload, GripVertical } from 'lucide-react';

export default function GlobalUIBuilder() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'popup'>('header');

  // Header State
  const [headerConfig, setHeaderConfig] = useState<any>({
    template: 'premium',
    menuItems: [
      { id: 'womens-care', title: "Women's Care", categories: ['Intimate Care Oils', 'Body Massage Oils', 'Wellness Roll-ons'], concerns: ['Monthly Comfort', 'Leg Comfort', 'Stress Relief'], image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600', animationType: 'zoom-in', animationTiming: 0.7 },
      { id: 'wellness-category', title: "Wellness Category", categories: ['Essential Oils', 'Carrier Oils', 'Massage Oils'], concerns: ['Vitality', 'Sleep Comfort', 'Muscle Soothing'], image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600', animationType: 'zoom-in', animationTiming: 0.7 },
      { id: 'mother-care', title: "MOTHER Care", categories: ['Pre-natal Oils', 'Post-natal Oils', 'Stretch Mark Oils'], concerns: ['Skin Elasticity', 'Body Relaxation', 'Calming'], image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600', animationType: 'zoom-in', animationTiming: 0.7 },
      { id: 'men-care', title: "Men Care", categories: ['Beard Oils', 'Face Serums', 'Muscle Recovery Oils'], concerns: ['Beard Nourishment', 'Post-Workout Soothing', 'Skin Radiance'], image: 'https://images.unsplash.com/photo-1623588958271-8c019027df2b?auto=format&fit=crop&q=80&w=600', animationType: 'zoom-in', animationTiming: 0.7 },
      { id: 'hair-care', title: "Hair Care", categories: ['Hair Nourishing Oils', 'Scalp Serums', 'Hair Tonics'], concerns: ['Hair Vitality', 'Scalp Health', 'Natural Shine'], image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=600', animationType: 'zoom-in', animationTiming: 0.7 },
      { id: 'face-and-body', title: "Face and Body", categories: ['Face Serums', 'Body Oils', 'Facial Toners'], concerns: ['Clear Skin', 'Youthful Glow', 'Skin Hydration'], image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600', animationType: 'zoom-in', animationTiming: 0.7 },
      { id: 'attar-and-toners', title: "Attar and Toners", categories: ['Premium Attars', 'Facial Toners', 'Floral Waters'], concerns: ['Long-lasting Fragrance', 'Skin Refreshment', 'Pore Tightening'], image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600', animationType: 'zoom-in', animationTiming: 0.7 },
      { id: 'baby-care-range', title: "Baby Care Range", categories: ['Baby Massage Oils', 'Gentle Serums', 'Soothing Oils'], concerns: ['Baby Skin Comfort', 'Gentle Nourishment', 'Skin Softness'], image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=600', animationType: 'zoom-in', animationTiming: 0.7 }
    ]
  });

  // Popup State
  const [popupConfig, setPopupConfig] = useState<any>({
    enabled: false,
    title: 'Welcome to Divine Cardinal',
    description: 'Sign up to our newsletter for 10% off your first order.',
    buttonText: 'Subscribe Now',
    link: '/pages/soundarya-club',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600'
  });

  // Footer State
  const [footerConfig, setFooterConfig] = useState<any>({
    columns: [
      {
        id: 'story',
        title: 'DIVINE CARDINAL',
        text: 'A premium union of Vedic wisdom and modern luxury. We distill original botanical wellness remedies, crafted with purity, intention, and respect for nature.\n\nMade in Hathras, India.',
        links: []
      },
      {
        id: 'shop',
        title: 'Shop Categories',
        text: '',
        links: [
          { label: 'Face & Body Serums', url: '/shop?category=face-and-body' },
          { label: 'Therapeutic Massage Oils', url: '/shop?category=wellness' },
          { label: 'Baby & Mother Care', url: '/shop?category=baby-and-mother-care' },
          { label: 'Traditional Attars & Perfumes', url: '/shop?category=fragrance-attars' }
        ]
      },
      {
        id: 'support',
        title: 'Customer Support',
        text: '',
        links: [
          { label: 'Frequently Asked Questions', url: '/pages/faqs' },
          { label: 'Ingredients Glossary', url: '/ingredients' },
          { label: 'Shipping & Estimations', url: '/pages/shipping-policy' },
          { label: 'Returns & Refunds', url: '/pages/returns-refunds' },
          { label: 'Terms of Service', url: '/pages/terms-and-conditions' },
          { label: 'Admin Dashboard', url: '/admin/login' }
        ]
      },
      {
        id: 'newsletter',
        title: 'The Journal Newsletter',
        text: 'Subscribe to receive Ayurvedic wellness insights, early access to new distillations, and seasonal offers.',
        links: []
      }
    ]
  });

  useEffect(() => {
    const headerRef = ref(db, 'global_elements/header');
    const footerRef = ref(db, 'global_elements/footer');
    const popupRef = ref(db, 'global_elements/popup');

    let headerDone = false;
    let footerDone = false;
    let popupDone = false;
    
    const checkDone = () => {
      if (headerDone && footerDone && popupDone) {
        setLoading(false);
      }
    };

    const unsubHeader = onValue(headerRef, (snapshot) => {
      if (snapshot.exists()) {
        setHeaderConfig(snapshot.val());
      }
      headerDone = true;
      checkDone();
    }, (error) => {
      console.error(error);
      headerDone = true;
      checkDone();
    });

    const unsubFooter = onValue(footerRef, (snapshot) => {
      if (snapshot.exists()) {
        setFooterConfig(snapshot.val());
      }
      footerDone = true;
      checkDone();
    }, (error) => {
      console.error(error);
      footerDone = true;
      checkDone();
    });

    const unsubPopup = onValue(popupRef, (snapshot) => {
      if (snapshot.exists()) {
        setPopupConfig(snapshot.val());
      }
      popupDone = true;
      checkDone();
    }, (error) => {
      console.error(error);
      popupDone = true;
      checkDone();
    });
    
    // Fallback just in case Firebase takes too long or doesn't fire for non-existent paths
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      unsubHeader();
      unsubFooter();
      unsubPopup();
      clearTimeout(timeout);
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await set(ref(db, 'global_elements/header'), headerConfig);
      await set(ref(db, 'global_elements/footer'), footerConfig);
      await set(ref(db, 'global_elements/popup'), popupConfig);
      alert('Global UI configurations saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  // Utility to handle media uploads
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploadRes = await fetch(`/api/backend/cms/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();
      callback(uploadData.url);
    } catch (err) {
      console.error('File upload error:', err);
      // Fallback
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Add Menu Item
  const addMenuItem = () => {
    setHeaderConfig({
      ...headerConfig,
      menuItems: [
        ...(headerConfig.menuItems || []),
        { id: `menu_${Date.now()}`, title: 'New Menu', link: '/shop', categories: [], concerns: [], image: '' }
      ]
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Configuration...</div>;

  return (
    <div className="space-y-6 text-left pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-300 pb-4 gap-4 sticky top-0 bg-[#F1F1F1] z-10 py-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#1A1A1A]">Global UI Settings</h1>
          <p className="text-xs text-gray-500 mt-1">Manage Header and Footer layouts and contents sitewide.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#008060] hover:bg-[#006e52] text-white px-5 py-2 rounded text-sm font-semibold shadow flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      <div className="flex space-x-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('header')}
          className={`pb-2 px-1 text-sm font-medium ${activeTab === 'header' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Header (Navbar)
        </button>
        <button 
          onClick={() => setActiveTab('footer')}
          className={`pb-2 px-1 text-sm font-medium ${activeTab === 'footer' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Footer
        </button>
        <button 
          onClick={() => setActiveTab('popup')}
          className={`pb-2 px-1 text-sm font-medium ${activeTab === 'popup' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Promotional Popup
        </button>
      </div>

      {activeTab === 'header' && (
        <div className="space-y-8 bg-white p-6 rounded border border-gray-200 shadow-sm">
          <div>
            <h3 className="font-bold text-[#1A1A1A] mb-2">Navbar Template</h3>
            <select 
              value={headerConfig.template || 'premium'}
              onChange={(e) => setHeaderConfig({ ...headerConfig, template: e.target.value })}
              className="w-full max-w-sm border border-gray-300 rounded p-2 text-sm focus:border-[#008060] outline-none"
            >
              <option value="simple">Simple (Dropdown Menu Only)</option>
              <option value="advanced">Advanced (Multi-category Links)</option>
              <option value="premium">Premium (Multi-category + Media Animations)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1A1A1A]">Menu Items</h3>
              <button onClick={addMenuItem} className="text-xs bg-gray-100 border border-gray-300 px-3 py-1.5 rounded flex items-center space-x-1 hover:bg-gray-200">
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {(headerConfig.menuItems || []).map((item: any, idx: number) => (
                <div key={item.id} className="border border-gray-200 p-4 rounded bg-gray-50 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Menu Title</label>
                      <input 
                        type="text" 
                        value={item.title || ''}
                        onChange={(e) => {
                          const newItems = [...headerConfig.menuItems];
                          newItems[idx].title = e.target.value;
                          setHeaderConfig({ ...headerConfig, menuItems: newItems });
                        }}
                        className="w-full border border-gray-300 rounded p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Link Destination</label>
                      <input 
                        type="text" 
                        value={item.link || ''}
                        onChange={(e) => {
                          const newItems = [...headerConfig.menuItems];
                          newItems[idx].link = e.target.value;
                          setHeaderConfig({ ...headerConfig, menuItems: newItems });
                        }}
                        className="w-full border border-gray-300 rounded p-2 text-xs"
                      />
                    </div>
                  </div>

                  {(headerConfig.template === 'advanced' || headerConfig.template === 'premium') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                      <div>
                        <label className="text-xs font-semibold block mb-1">Shop by Category (Comma separated)</label>
                        <textarea 
                          rows={3}
                          value={item.categories ? item.categories.join(', ') : ''}
                          onChange={(e) => {
                            const newItems = [...headerConfig.menuItems];
                            newItems[idx].categories = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setHeaderConfig({ ...headerConfig, menuItems: newItems });
                          }}
                          className="w-full border border-gray-300 rounded p-2 text-xs font-mono"
                          placeholder="Face Serums, Body Oils..."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold block mb-1">Shop by Concern (Comma separated)</label>
                        <textarea 
                          rows={3}
                          value={item.concerns ? item.concerns.join(', ') : ''}
                          onChange={(e) => {
                            const newItems = [...headerConfig.menuItems];
                            newItems[idx].concerns = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setHeaderConfig({ ...headerConfig, menuItems: newItems });
                          }}
                          className="w-full border border-gray-300 rounded p-2 text-xs font-mono"
                          placeholder="Acne, Glowing Skin..."
                        />
                      </div>
                    </div>
                  )}

                  {headerConfig.template === 'premium' && (
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <label className="text-xs font-semibold block mb-1">Featured Banner Media (Image/Video)</label>
                      <div className="flex items-center space-x-4">
                        <input 
                          type="text"
                          value={item.image || ''}
                          onChange={(e) => {
                            const newItems = [...headerConfig.menuItems];
                            newItems[idx].image = e.target.value;
                            setHeaderConfig({ ...headerConfig, menuItems: newItems });
                          }}
                          className="flex-1 border border-gray-300 rounded p-2 text-xs"
                          placeholder="Paste image/video URL here"
                        />
                        <div className="relative">
                          <input 
                            type="file" 
                            className="hidden" 
                            id={`upload_media_${idx}`}
                            accept="image/*,video/*"
                            onChange={(e) => handleUpload(e, (url) => {
                              const newItems = [...headerConfig.menuItems];
                              newItems[idx].image = url;
                              setHeaderConfig({ ...headerConfig, menuItems: newItems });
                            })}
                          />
                          <label htmlFor={`upload_media_${idx}`} className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-xs cursor-pointer font-semibold inline-block">
                            Upload Media
                          </label>
                        </div>
                      </div>
                      {item.image && (
                        <div className="mt-2 h-24 w-48 bg-gray-200 rounded border border-gray-300 overflow-hidden relative flex items-center justify-center">
                          {item.image.includes('.mp4') ? (
                            <video src={item.image} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                          ) : (
                            <img src={item.image} className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="text-xs font-semibold block mb-1">Animation Type</label>
                          <select 
                            value={item.animationType || 'zoom-in'}
                            onChange={(e) => {
                              const newItems = [...headerConfig.menuItems];
                              newItems[idx].animationType = e.target.value;
                              setHeaderConfig({ ...headerConfig, menuItems: newItems });
                            }}
                            className="w-full border border-gray-300 rounded p-2 text-xs"
                          >
                            <option value="none">None</option>
                            <option value="zoom-in">Zoom In</option>
                            <option value="fade-in">Fade In</option>
                            <option value="slide-up">Slide Up</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold block mb-1">Animation Duration (Seconds)</label>
                          <input 
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={item.animationTiming || 0.7}
                            onChange={(e) => {
                              const newItems = [...headerConfig.menuItems];
                              newItems[idx].animationTiming = parseFloat(e.target.value) || 0;
                              setHeaderConfig({ ...headerConfig, menuItems: newItems });
                            }}
                            className="w-full border border-gray-300 rounded p-2 text-xs"
                            placeholder="e.g. 0.7"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      const newItems = headerConfig.menuItems.filter((_: any, i: number) => i !== idx);
                      setHeaderConfig({ ...headerConfig, menuItems: newItems });
                    }}
                    className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {(!headerConfig.menuItems || headerConfig.menuItems.length === 0) && (
                <div className="text-center p-8 border border-dashed border-gray-300 rounded text-gray-400 text-sm">
                  No menu items created. Click "Add Item" to start.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'footer' && (
        <div className="space-y-6 bg-white p-6 rounded border border-gray-200 shadow-sm">
          <h3 className="font-bold text-[#1A1A1A] mb-4">Footer Columns</h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {(footerConfig.columns || []).map((col: any, idx: number) => (
              <div key={col.id} className="border border-gray-200 p-4 rounded bg-gray-50">
                <div className="mb-4">
                  <label className="text-xs font-semibold block mb-1">Column Title</label>
                  <input 
                    type="text" 
                    value={col.title || ''}
                    onChange={(e) => {
                      const newCols = [...footerConfig.columns];
                      newCols[idx].title = e.target.value;
                      setFooterConfig({ ...footerConfig, columns: newCols });
                    }}
                    className="w-full border border-gray-300 rounded p-2 text-sm font-serif"
                  />
                </div>
                <div className="mb-4">
                  <label className="text-xs font-semibold block mb-1">Column Text / Description</label>
                  <textarea 
                    rows={3}
                    value={col.text || ''}
                    onChange={(e) => {
                      const newCols = [...footerConfig.columns];
                      newCols[idx].text = e.target.value;
                      setFooterConfig({ ...footerConfig, columns: newCols });
                    }}
                    className="w-full border border-gray-300 rounded p-2 text-xs"
                    placeholder="Optional description text..."
                  />
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold block">Links</label>
                    <button 
                      onClick={() => {
                        const newCols = [...footerConfig.columns];
                        newCols[idx].links = [...(newCols[idx].links || []), { label: 'New Link', url: '/' }];
                        setFooterConfig({ ...footerConfig, columns: newCols });
                      }}
                      className="text-[10px] bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                      + Add Link
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(col.links || []).map((link: any, linkIdx: number) => (
                      <div key={linkIdx} className="flex items-center space-x-2">
                        <input 
                          type="text" 
                          value={link.label || ''}
                          placeholder="Label"
                          onChange={(e) => {
                            const newCols = [...footerConfig.columns];
                            newCols[idx].links[linkIdx].label = e.target.value;
                            setFooterConfig({ ...footerConfig, columns: newCols });
                          }}
                          className="w-1/2 border border-gray-300 rounded p-1.5 text-xs"
                        />
                        <input 
                          type="text" 
                          value={link.url || ''}
                          placeholder="URL"
                          onChange={(e) => {
                            const newCols = [...footerConfig.columns];
                            newCols[idx].links[linkIdx].url = e.target.value;
                            setFooterConfig({ ...footerConfig, columns: newCols });
                          }}
                          className="w-1/2 border border-gray-300 rounded p-1.5 text-xs"
                        />
                        <button 
                          onClick={() => {
                            const newCols = [...footerConfig.columns];
                            newCols[idx].links = newCols[idx].links.filter((_: any, i: number) => i !== linkIdx);
                            setFooterConfig({ ...footerConfig, columns: newCols });
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'popup' && (
        <div className="space-y-6 bg-white p-6 rounded border border-gray-200 shadow-sm max-w-3xl">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h3 className="font-bold text-[#1A1A1A]">Promotional Popup Settings</h3>
            <label className="flex items-center space-x-2 cursor-pointer">
              <span className="text-sm font-medium">Enable Popup</span>
              <input 
                type="checkbox" 
                checked={popupConfig.enabled}
                onChange={(e) => setPopupConfig({ ...popupConfig, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#008060]"
              />
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Popup Title</label>
                <input 
                  type="text" 
                  value={popupConfig.title || ''}
                  onChange={(e) => setPopupConfig({ ...popupConfig, title: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={popupConfig.description || ''}
                  onChange={(e) => setPopupConfig({ ...popupConfig, description: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Button Text</label>
                <input 
                  type="text" 
                  value={popupConfig.buttonText || ''}
                  onChange={(e) => setPopupConfig({ ...popupConfig, buttonText: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Button Link</label>
                <input 
                  type="text" 
                  value={popupConfig.link || ''}
                  onChange={(e) => setPopupConfig({ ...popupConfig, link: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-semibold block mb-1">Popup Image</label>
              <div className="flex items-center space-x-4 mb-2">
                <input 
                  type="text"
                  value={popupConfig.image || ''}
                  onChange={(e) => setPopupConfig({ ...popupConfig, image: e.target.value })}
                  className="flex-1 border border-gray-300 rounded p-2 text-xs"
                  placeholder="Image URL"
                />
                <div className="relative">
                  <input 
                    type="file" 
                    className="hidden" 
                    id="upload_popup_image"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, (url) => setPopupConfig({ ...popupConfig, image: url }))}
                  />
                  <label htmlFor="upload_popup_image" className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-xs cursor-pointer font-semibold inline-block">
                    Upload
                  </label>
                </div>
              </div>
              {popupConfig.image && (
                <div className="h-48 w-full bg-gray-100 rounded border border-gray-300 overflow-hidden relative flex items-center justify-center">
                  <img src={popupConfig.image} className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
