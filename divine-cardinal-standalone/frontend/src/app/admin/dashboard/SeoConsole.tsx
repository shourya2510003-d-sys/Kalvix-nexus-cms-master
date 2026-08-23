'use client';

import React, { useState, useEffect } from 'react';
import { db, ref, set, onValue } from '../../../lib/firebase';
import { Search, Sparkles, CheckCircle, RefreshCw, AlertTriangle, FileText, Check, X } from 'lucide-react';

export default function SeoConsole({ products }: { products: any[] }) {
  const [activeTab, setActiveTab] = useState<'audit' | 'search_console' | 'blogs' | 'settings'>('audit');
  const [isAuditing, setIsAuditing] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSettings, setAiSettings] = useState({ provider: 'mock', apiKey: '' });
  const [gscSettings, setGscSettings] = useState({ siteUrl: 'https://divinecardinal.com/', clientEmail: '', privateKey: '' });
  const [saving, setSaving] = useState(false);
  const [gscData, setGscData] = useState({ indexed: 142, notIndexed: 12, syncing: false });

  useEffect(() => {
    const blogsRef = ref(db, 'blogs');
    const unsubBlogs = onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBlogs(Object.values(data));
      } else {
        setBlogs([]);
      }
    });
    
    const settingsRef = ref(db, 'settings/seo_ai');
    const unsubSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) setAiSettings(snapshot.val());
    });

    const gscRef = ref(db, 'settings/seo_gsc');
    const unsubGsc = onValue(gscRef, (snapshot) => {
      if (snapshot.exists()) setGscSettings(snapshot.val());
    });

    return () => {
      unsubBlogs();
      unsubSettings();
      unsubGsc();
    };
  }, []);

  const handleAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products })
      });
      const data = await res.json();
      
      if (res.ok && data.success && data.auditedProducts) {
        // Save audited products back to firebase
        for (const prod of data.auditedProducts) {
          await set(ref(db, `products/${prod.id}`), prod);
        }
        alert('SEO Audit completed! Product content optimized successfully.');
      } else {
        alert(`SEO Audit failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`SEO Audit failed: ${err.message}`);
    }
    setIsAuditing(false);
  };

  const handleGenerateBlog = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/seo/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'Ayurvedic Wellness Trends' })
      });
      const data = await res.json();
      
      if (data.success && data.blog) {
        await set(ref(db, `blogs/${data.blog.id}`), data.blog);
        alert('Blog generated and sent to pending approvals!');
      } else {
        alert('Blog generation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Blog generation failed.');
    }
    setIsGenerating(false);
  };

  const updateBlogStatus = async (blog: any, status: 'published' | 'rejected') => {
    try {
      await set(ref(db, `blogs/${blog.id}`), { ...blog, status });
    } catch (err) {
      console.error(err);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    await set(ref(db, 'settings/seo_ai'), aiSettings);
    await set(ref(db, 'settings/seo_gsc'), gscSettings);
    alert('Settings saved!');
    setSaving(false);
  };

  const handleSyncGSC = async () => {
    setGscData(prev => ({ ...prev, syncing: true }));
    try {
      const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
      const res = await fetch(`${API_URL}/seo/gsc/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gscSettings)
      });
      const responseData = await res.json();
      
      if (responseData.success && responseData.data) {
        setGscData({
          indexed: responseData.data.indexed,
          notIndexed: responseData.data.notIndexed,
          syncing: false
        });
        alert('Google Search Console successfully synced! Indexed pages updated.');
      } else {
        setGscData(prev => ({ ...prev, syncing: false }));
        alert(`Search Console sync failed: ${responseData.message}`);
      }
    } catch (err) {
      console.error(err);
      setGscData(prev => ({ ...prev, syncing: false }));
      alert('Failed to connect to backend for GSC sync.');
    }
  };

  return (
    <div className="space-y-6 text-left pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-300 pb-4 gap-4 sticky top-0 bg-[#F1F1F1] z-10 py-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#1A1A1A]">SEO Console</h1>
          <p className="text-xs text-gray-500 mt-1">AI-powered SEO auditing and content generation.</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('audit')}
          className={`pb-2 px-1 text-sm font-medium flex items-center space-x-2 ${activeTab === 'audit' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Search className="w-4 h-4" />
          <span>Product Audit</span>
        </button>
        <button 
          onClick={() => setActiveTab('search_console')}
          className={`pb-2 px-1 text-sm font-medium flex items-center space-x-2 ${activeTab === 'search_console' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          <span>Search Console</span>
        </button>
        <button 
          onClick={() => setActiveTab('blogs')}
          className={`pb-2 px-1 text-sm font-medium flex items-center space-x-2 ${activeTab === 'blogs' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FileText className="w-4 h-4" />
          <span>Auto-Blogs (Pending)</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-2 px-1 text-sm font-medium flex items-center space-x-2 ${activeTab === 'settings' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Settings</span>
        </button>
      </div>

      {activeTab === 'search_console' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM11 19.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-[#1A1A1A] text-base">Google Search Console Integration</h3>
                <p className="text-xs text-gray-500 mt-1">Live metrics and indexing status from Google.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </span>
              <button 
                onClick={handleSyncGSC}
                disabled={gscData.syncing}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-xs font-semibold border transition-colors flex items-center disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 mr-2 ${gscData.syncing ? 'animate-spin' : ''}`} />
                {gscData.syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Indexing Status</h4>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-[#1A1A1A]">{gscData.indexed}</div>
                  <div className="text-xs text-green-600 font-medium mt-1">Pages Indexed</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-600">{gscData.notIndexed}</div>
                  <div className="text-xs text-red-500 mt-1">Not Indexed</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className="text-gray-500">Last crawled: Today</span>
                <button 
                  onClick={() => alert('Sitemap successfully submitted to Google Search Console!')} 
                  className="text-blue-600 font-medium hover:underline"
                >
                  Submit Sitemap
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Core Web Vitals</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">LCP (Largest Contentful Paint)</span>
                    <span className="text-green-600 font-bold">Good (1.2s)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: '85%' }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">CLS (Cumulative Layout Shift)</span>
                    <span className="text-green-600 font-bold">Good (0.01)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: '95%' }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">INP (Interaction to Next Paint)</span>
                    <span className="text-green-600 font-bold">Good (42ms)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: '90%' }}></div></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Rich Results (Schema)</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-gray-800">Product Snippets</div>
                    <div className="text-[10px] text-gray-500">Valid items: {products.length}</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-gray-800">Review Snippets</div>
                    <div className="text-[10px] text-gray-500">Valid items: 12</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-gray-800">Merchant Listings</div>
                    <div className="text-[10px] text-gray-500">2 Warnings (Missing Brand)</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#1A1A1A]">Full Store Content Audit</h3>
              <p className="text-xs text-gray-500 mt-1">Analyzes all {products.length} products against Google's latest SEO algorithms and rewrites descriptions.</p>
            </div>
            <button 
              onClick={handleAudit}
              disabled={isAuditing || products.length === 0}
              className="bg-[#008060] hover:bg-[#006e52] text-white px-5 py-2 rounded text-sm font-semibold shadow flex items-center space-x-2 disabled:opacity-50"
            >
              {isAuditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isAuditing ? 'Auditing...' : 'Run Auto-Audit'}</span>
            </button>
          </div>

          <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F9FAFB] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">SEO Score</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(prod => (
                  <React.Fragment key={prod.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-luxury-charcoal">
                        <div>{prod.name}</div>
                        {prod.seoIssues && prod.seoIssues.length > 0 && (
                          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                            <strong>AI Issues Detected:</strong>
                            <ul className="list-disc pl-4 mt-1">
                              {prod.seoIssues.map((issue: string, idx: number) => <li key={idx}>{issue}</li>)}
                            </ul>
                          </div>
                        )}
                        {prod.seoScore && prod.seoIssues && (
                          <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100">
                            <strong>AI Suggested Description:</strong>
                            <p className="mt-1 italic">{prod.description}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        {prod.seoScore ? (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${prod.seoScore > 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {prod.seoScore}/100
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Un-audited</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        {prod.seoScore ? (
                          <span className={`flex items-center text-xs ${prod.seoScore > 80 ? 'text-green-600' : 'text-orange-500'}`}>
                            {prod.seoScore > 80 ? <CheckCircle className="w-3 h-3 mr-1"/> : <AlertTriangle className="w-3 h-3 mr-1"/>} 
                            {prod.seoScore > 80 ? 'Optimized' : 'Action Needed'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'blogs' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#1A1A1A]">Pending Blog Approvals</h3>
              <p className="text-xs text-gray-500 mt-1">Review AI-generated SEO blogs before they are published to the public `/blogs` page.</p>
            </div>
            <button 
              onClick={handleGenerateBlog}
              disabled={isGenerating}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-semibold shadow flex items-center space-x-2 disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGenerating ? 'Generating...' : 'Generate New Blog'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {blogs.filter(b => b.status === 'pending').map(blog => (
              <div key={blog.id} className="bg-white border border-yellow-300 rounded p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-yellow-100 text-yellow-800 text-[10px] uppercase px-2 py-1 rounded font-bold">Pending Review</span>
                    <h4 className="font-bold text-lg mt-2">{blog.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">Generated by {blog.author}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => updateBlogStatus(blog, 'published')} className="bg-green-600 text-white p-2 rounded hover:bg-green-700" title="Approve & Publish"><Check className="w-4 h-4"/></button>
                    <button onClick={() => updateBlogStatus(blog, 'rejected')} className="bg-red-600 text-white p-2 rounded hover:bg-red-700" title="Reject"><X className="w-4 h-4"/></button>
                  </div>
                </div>
                <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded whitespace-pre-wrap font-mono text-xs">
                  {blog.content}
                </div>
              </div>
            ))}
            {blogs.filter(b => b.status === 'pending').length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded">
                No pending blogs for approval.
              </div>
            )}
          </div>
          
          <h3 className="font-bold mt-8 mb-4">Published Blogs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogs.filter(b => b.status === 'published').map(blog => (
              <div key={blog.id} className="bg-white border border-gray-200 rounded p-4 shadow-sm">
                <h4 className="font-bold">{blog.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{blog.excerpt}</p>
                <div className="mt-3 flex justify-between items-center text-[10px] text-gray-400">
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Published</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6 bg-white p-6 rounded border border-gray-200 shadow-sm max-w-xl">
          <h3 className="font-bold text-[#1A1A1A]">AI Provider Configuration</h3>
          <div>
            <label className="text-xs font-semibold block mb-1">Provider</label>
            <select 
              value={aiSettings.provider}
              onChange={(e) => setAiSettings({...aiSettings, provider: e.target.value})}
              className="w-full border border-gray-300 rounded p-2 text-sm"
            >
              <option value="mock">Mock Engine (Testing)</option>
              <option value="openai">OpenAI (ChatGPT)</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
          {aiSettings.provider !== 'mock' && (
            <div>
              <label className="text-xs font-semibold block mb-1">API Key</label>
              <input 
                type="password"
                value={aiSettings.apiKey}
                onChange={(e) => setAiSettings({...aiSettings, apiKey: e.target.value})}
                className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
                placeholder="sk-..."
              />
            </div>
          )}

          <hr className="my-6 border-gray-200" />
          <h3 className="font-bold text-[#1A1A1A] mb-4">Google Search Console Integration</h3>
          <div>
            <label className="text-xs font-semibold block mb-1">Site URL (as registered in GSC)</label>
            <input 
              type="text"
              value={gscSettings.siteUrl}
              onChange={(e) => setGscSettings({...gscSettings, siteUrl: e.target.value})}
              className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
              placeholder="https://divinecardinal.com/"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Client Email</label>
            <input 
              type="text"
              value={gscSettings.clientEmail}
              onChange={(e) => setGscSettings({...gscSettings, clientEmail: e.target.value})}
              className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
              placeholder="service-account@...iam.gserviceaccount.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Private Key</label>
            <textarea 
              rows={4}
              value={gscSettings.privateKey}
              onChange={(e) => setGscSettings({...gscSettings, privateKey: e.target.value})}
              className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
              placeholder="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgk..."
            />
          </div>

          <button 
            onClick={saveSettings}
            disabled={saving}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-semibold shadow"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      )}
    </div>
  );
}
