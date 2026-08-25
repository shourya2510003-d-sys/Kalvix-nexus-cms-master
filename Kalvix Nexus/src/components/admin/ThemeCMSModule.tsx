'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Archive, Loader2, Plus, Trash2, CheckCircle, Package } from 'lucide-react';
import { db } from '@/lib/firebase';
import { ref, push, set, onValue, remove } from 'firebase/database';
import JSZip from 'jszip';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';

export default function ThemeCMSModule() {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    const themesRef = ref(db, 'themes');
    const unsub = onValue(themesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const themeList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setThemes(themeList);
      } else {
        setThemes([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      alert('Please upload a valid .zip file containing the theme.json configuration.');
      return;
    }

    setUploading(true);
    setProgress(10);
    setStatusText('Extracting ZIP...');

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      let themeConfig: any = null;
      const filesToUpload: { name: string, data: Blob }[] = [];

      setProgress(30);
      setStatusText('Parsing configuration...');

      // Iterate through zip contents
      for (const [filename, zipEntry] of Object.entries(contents.files)) {
        if (!zipEntry.dir) {
          if (filename === 'theme.json' || filename.endsWith('/theme.json')) {
            const configText = await zipEntry.async('text');
            themeConfig = JSON.parse(configText);
          } else if (filename.match(/\.(png|jpe?g|gif|svg)$/i)) {
            // It's an image asset
            const blob = await zipEntry.async('blob');
            filesToUpload.push({ name: filename, data: blob });
          }
        }
      }

      if (!themeConfig) {
        throw new Error("theme.json not found in the ZIP archive.");
      }

      setProgress(50);
      setStatusText('Uploading assets...');

      const storage = getStorage(app);
      const assetMap: Record<string, string> = {};

      let i = 0;
      for (const fileObj of filesToUpload) {
        const ext = fileObj.name.split('.').pop();
        const safeName = `theme_${Date.now()}_${i}.${ext}`;
        const fileRef = storageRef(storage, `themes/assets/${safeName}`);
        await uploadBytes(fileRef, fileObj.data);
        const url = await getDownloadURL(fileRef);
        
        // Map the original filename in zip to the Firebase URL
        const originalName = fileObj.name.split('/').pop()!;
        assetMap[originalName] = url;
        i++;
      }

      setProgress(80);
      setStatusText('Saving Theme...');

      // Replace local asset references in themeConfig with Firebase URLs
      if (themeConfig.assets) {
         Object.keys(themeConfig.assets).forEach(key => {
           const localName = themeConfig.assets[key];
           if (assetMap[localName]) {
             themeConfig.assets[key] = assetMap[localName];
           }
         });
      }

      const newThemeRef = push(ref(db, 'themes'));
      await set(newThemeRef, {
        name: themeConfig.name || file.name.replace('.zip', ''),
        version: themeConfig.version || '1.0.0',
        config: themeConfig,
        uploadedAt: new Date().toISOString()
      });

      setProgress(100);
      setStatusText('Complete!');
      
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setStatusText('');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      alert('Upload failed: ' + err.message);
      setUploading(false);
    }
    
    // Reset file input
    e.target.value = '';
  };

  const deleteTheme = async (id: string) => {
    if (confirm('Are you sure you want to delete this theme?')) {
      await remove(ref(db, `themes/${id}`));
    }
  };

  return (
    <div className="bg-bg-primary min-h-[calc(100vh-4rem)] p-6 rounded-2xl border border-gold-primary/20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-orbitron font-black uppercase tracking-widest text-gold-primary">Theme CMS</h2>
          <p className="text-text-muted mt-1 text-sm">Upload and manage dynamically provisioned storefront themes.</p>
        </div>
        <div>
          <input 
            type="file" 
            id="theme-upload" 
            className="hidden" 
            accept=".zip"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label 
            htmlFor="theme-upload"
            className="cursor-pointer bg-gold-primary/10 hover:bg-gold-primary hover:text-black border border-gold-primary text-gold-primary px-4 py-2 rounded-lg font-rajdhani font-bold flex items-center gap-2 transition-all"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? 'Processing...' : 'Upload Theme (.zip)'}
          </label>
        </div>
      </div>

      {uploading && (
        <div className="mb-8 bg-bg-card p-6 rounded-xl border border-gold-primary/20">
          <div className="flex justify-between text-sm mb-2 font-rajdhani font-bold text-gold-light">
            <span>{statusText}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-2">
            <div className="bg-gold-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gold-primary" size={32} /></div>
      ) : themes.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gold-primary/30 rounded-2xl bg-bg-card/50">
          <Package className="w-12 h-12 text-gold-primary/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Themes Installed</h3>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            Upload a Theme ZIP containing a <code>theme.json</code> to make it available for merchants in the Store Builder.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map(theme => (
            <div key={theme.id} className="bg-bg-card border border-gold-primary/20 rounded-xl p-5 hover:border-gold-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gold-primary/10 flex items-center justify-center border border-gold-primary/20">
                    <Archive className="text-gold-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold font-orbitron truncate w-32">{theme.name}</h3>
                    <span className="text-xs text-text-muted">v{theme.version}</span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteTheme(theme.id)}
                  className="text-text-muted hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="text-xs text-text-muted mt-4 bg-black/30 p-3 rounded-lg overflow-hidden text-ellipsis whitespace-nowrap">
                ID: {theme.id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
