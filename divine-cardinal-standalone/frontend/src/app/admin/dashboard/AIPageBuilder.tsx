'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Wand2, Loader2, Save, LayoutTemplate, History } from 'lucide-react';

export default function AIPageBuilder() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [generatedJson, setGeneratedJson] = useState<any>(null);

  // Poll for job status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (jobId && loading) {
      interval = setInterval(async () => {
        try {
          const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
          const res = await fetch(`${API_URL}/ai-builder/status/${jobId}`);
          const data = await res.json();
          
          if (data.status === 'completed') {
            setProgress(100);
            setLoading(false);
            setGeneratedJson({ pageId: data.result?.pageId, status: 'Success' }); // Mocking fetch of actual JSON for now
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setLoading(false);
            alert(`Generation failed: ${data.error}`);
            clearInterval(interval);
          } else {
            setProgress(data.progress || 10);
          }
        } catch (e) {
          console.error(e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId, loading]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setProgress(0);
    setGeneratedJson(null);
    try {
      const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
      const res = await fetch(`${API_URL}/ai-builder/generate/page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tenantId: 'default-tenant' }) // Mock tenant for now
      });
      const data = await res.json();
      if (data.success) {
        setJobId(data.jobId);
      } else {
        alert('Failed to queue AI generation');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error communicating with AI Builder API');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-luxury-charcoal flex items-center">
          <img src="/ai-logo.jpg" alt="AI Avatar" className="w-8 h-8 mr-3 object-contain rounded-full border border-luxury-gold" />
          CMS AI Builder
        </h2>
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 border border-gray-200 text-sm hover:bg-gray-50 transition-colors">
            <History className="w-4 h-4 mr-2" />
            History
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-200 text-sm hover:bg-gray-50 transition-colors">
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Templates
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 shadow-sm">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
          Describe the website or page you want to build
        </label>
        <div className="flex space-x-4">
          <input
            type="text"
            className="flex-1 border-b border-gray-300 py-3 focus:outline-none focus:border-luxury-gold transition-colors text-lg"
            placeholder="e.g., Create a premium skincare homepage with a dark theme and video hero..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="bg-luxury-gold text-white px-8 py-3 hover:bg-black transition-colors flex items-center shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {loading && (
          <div className="mt-8">
            <div className="flex justify-between text-xs text-gray-500 mb-2 uppercase tracking-wide">
              <span>Compiling Layouts & Themes</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 h-1">
              <div 
                className="bg-luxury-gold h-1 transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {generatedJson && (
        <div className="bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h3 className="font-serif text-xl">Visual Drag & Drop Builder (Preview)</h3>
            <button className="flex items-center text-sm text-green-600 font-semibold bg-green-50 px-4 py-2">
              <Save className="w-4 h-4 mr-2" />
              Saved to CMS (Page ID: {generatedJson.pageId})
            </button>
          </div>
          
          {/* Mock Drag & Drop Interface */}
          <div className="border-2 border-dashed border-gray-300 p-12 text-center text-gray-400 bg-gray-50">
            <LayoutTemplate className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="font-serif text-lg text-gray-600 mb-2">Component Tree Generated Successfully</p>
            <p className="text-sm">The generated structured JSON has been compiled into editable CMS CmsComponent entities.</p>
            <div className="mt-6 inline-flex items-center px-4 py-2 border border-gray-200 bg-white shadow-sm text-sm cursor-pointer hover:bg-gray-50">
              Open Full Drag & Drop Editor
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
