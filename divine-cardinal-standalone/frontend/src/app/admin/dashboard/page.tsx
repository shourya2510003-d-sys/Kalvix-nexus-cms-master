'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { 
  Home, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  Settings, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Filter, 
  Play, 
  User as UserIcon, 
  Check, 
  Sparkles,
  ChevronRight,
  TrendingDown,
  Info,
  ArrowLeft,
  Calendar,
  Layers,
  Tag,
  Monitor,
  Smartphone,
  Globe,
  Database,
  Link2,
  Tv,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Star,
  Settings as SettingsIcon,
  Trash2,
  Folder,
  Layout,
  BookOpen,
  FileText,
  LayoutTemplate,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { db, ref, set, remove, onValue, get } from '../../../lib/firebase';
import HomeClient from '../../HomeClient';
import ProductClient from '../../products/[handle]/ProductClient';
import GlobalUIBuilder from './GlobalUIBuilder';
import IngredientsBuilder from './IngredientsBuilder';
import ShopFiltersBuilder from './ShopFiltersBuilder';
import DiscountsBuilder from './DiscountsBuilder';
import IntegrationsBuilder from './IntegrationsBuilder';
import SeoConsole from './SeoConsole';
import AIPageBuilder from './AIPageBuilder';
import RichTextEditor from './components/RichTextEditor';
import { DEFAULT_HOMEPAGE_LAYOUT } from '../../../lib/defaultLayout';
import ThemeStore from './ThemeStore';
import { ALL_THEME_SECTIONS } from './themes';

const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';

export default function NexusAdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const getDraftLayoutKey = (pageId: string) => {
    return pageId === 'home' ? 'drafts/homepage_layout' : `drafts/layouts/page-${pageId}`;
  };

  const getPublishedLayoutKey = (pageId: string) => {
    return pageId === 'home' ? 'homepage_layout' : `layouts/page-${pageId}`;
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  // Load products, orders and live visitors from Firebase Realtime Database
  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProductsList(Object.values(data) as any[]);
      } else {
        setProductsList([]);
      }
    });

    const ordersRef = ref(db, 'orders');
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data) as any[];
        list.reverse(); // Show newest orders first
        setOrdersList(list);
        
        // Sum up total paid sales
        const paidSales = list
          .filter(o => o.paymentStatus === 'Paid')
          .reduce((sum, o) => sum + o.total, 0);
        setTotalSales(paidSales);
        setOrdersCount(list.length);
      } else {
        setOrdersList([]);
        setTotalSales(0);
        setOrdersCount(0);
      }
    });

    const visitsRef = ref(db, 'live_visits');
    const unsubscribeVisits = onValue(visitsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data) as any[];
        // Sort descending
        list.sort((a, b) => b.timestamp - a.timestamp);
        setLiveVisitsLog(list.slice(0, 10));
        
        // Count visitors active in last 10 minutes
        const tenMinsAgo = Date.now() - 600000;
        const activeVisits = list.filter(v => v.timestamp > tenMinsAgo);
        setLiveVisitors(Math.max(1, activeVisits.length));
        setSessionsCount(640 + list.length);
      } else {
        setLiveVisitsLog([]);
        setLiveVisitors(1);
        setSessionsCount(640);
      }
    });

    const reviewsRef = ref(db, 'reviews');
    const unsubscribeReviews = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setReviewsList(Object.values(data) as any[]);
      } else {
        setReviewsList([]);
      }
    });

    // Fetch pages registry for custom pages
    const registryRef = ref(db, 'pages_registry');
    const unsubscribeRegistry = onValue(registryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPagesRegistry(Object.values(data));
      } else {
        setPagesRegistry([]);
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeVisits();
      unsubscribeReviews();
      unsubscribeRegistry();
    };
  }, []);

  // Effect specifically for fetching the active page layout is moved below state declarations

  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'products' | 'customers' | 'analytics' | 'reviews' | 'store' | 'filters' | 'storage' | 'global_ui' | 'ingredients' | 'discounts' | 'integrations' | 'seo' | 'ai_builder' | 'theme_store' | 'email'>('home');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState<any>(null);
  
  // Custom states for live demo interaction
  const [productsList, setProductsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [homepageLayout, setHomepageLayout] = useState<any[]>([]);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [editModalTab, setEditModalTab] = useState<'content' | 'design'>('content');
  
  // Multi-page CMS states
  const [currentPageId, setCurrentPageId] = useState<string>('home');
  const jsonEditorRef = useRef<HTMLTextAreaElement>(null);
  const [pagesRegistry, setPagesRegistry] = useState<any[]>([]);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [newPageForm, setNewPageForm] = useState({ title: '', slug: '' });

  // Live Preview & Publish states
  const [previewMode, setPreviewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

  const [storageFiles, setStorageFiles] = useState<any[]>([]);
  const [isStorageLoading, setIsStorageLoading] = useState(false);

  const fetchStorageFiles = async () => {
    setIsStorageLoading(true);
    try {
      const res = await fetch(`${API_URL}/cms/storage`);
      if (res.ok) setStorageFiles(await res.json());
    } catch (err) {
      console.error('Failed to fetch storage files', err);
    }
    setIsStorageLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'storage') {
      fetchStorageFiles();
    }
  }, [activeTab]);

  const [customersList, setCustomersList] = useState([
    { name: 'Hema Longani', email: 'hemalongani@gmail.com', subscribed: true, location: 'Ahilyanagar MH, India', orders: 1, spent: 850 },
    { name: 'kathirvelswamigal@gmail.com', email: 'kathirvelswamigal@gmail.com', subscribed: true, location: 'Tamil Nadu, India', orders: 0, spent: 0 },
    { name: 'Neeraj Kashyap', email: 'neeraj.k@yahoo.com', subscribed: true, location: 'Noida UP, India', orders: 0, spent: 0 },
    { name: 'Pratap Singh', email: 'pratap.singh@gmail.com', subscribed: false, location: 'Adipur Gandhidham GJ, India', orders: 1, spent: 1100 },
    { name: 'Palaniappan Ramanathan', email: 'palani.r@gmail.com', subscribed: true, location: 'Chennai TN, India', orders: 1, spent: 850 },
    { name: 'Pooja Shehrawat', email: 'pooja.s@gmail.com', subscribed: false, location: 'Gurugram HR, India', orders: 1, spent: 599 },
    { name: 'K Girinath', email: 'k.girinath@gmail.com', subscribed: true, location: 'Chennai TN, India', orders: 3, spent: 6049 },
  ]);

  // Effect specifically for fetching the active page layout
  useEffect(() => {
    const draftLayoutKey = getDraftLayoutKey(currentPageId);
    const publishedLayoutKey = getPublishedLayoutKey(currentPageId);

    try {
      const cached = localStorage.getItem(`dc_draft_layout_${currentPageId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHomepageLayout(parsed);
        }
      }
    } catch (_) {}

    let latestDraft: any[] | null = null;
    let latestPub: any[] | null = null;
    let hasLoadedDraft = false;
    let hasLoadedPub = false;

    const syncStates = () => {
      // 1. Resolve which layout to show in builder
      if (latestDraft && latestDraft.length > 0) {
        setHomepageLayout(latestDraft);
      } else if (latestPub && latestPub.length > 0) {
        setHomepageLayout(latestPub);
      } else if (hasLoadedDraft && hasLoadedPub) {
        // Both loaded and returned empty
        if (currentPageId === 'home') {
          setHomepageLayout(DEFAULT_HOMEPAGE_LAYOUT);
        } else {
          setHomepageLayout([]);
        }
      }

      // 2. Resolve unpublished changes badge
      if (latestDraft && latestPub) {
        const cleanDraft = latestDraft.map(s => ({ id: s.id, order: s.order, visible: s.visible, data: s.data || {}, styles: s.styles || {} }));
        const cleanPub = latestPub.map(s => ({ id: s.id, order: s.order, visible: s.visible, data: s.data || {}, styles: s.styles || {} }));
        const draftStr = JSON.stringify(cleanDraft.sort((a,b) => a.id.localeCompare(b.id)));
        const pubStr = JSON.stringify(cleanPub.sort((a,b) => a.id.localeCompare(b.id)));
        setHasUnpublishedChanges(draftStr !== pubStr);
      } else if (latestDraft && latestDraft.length > 0) {
        setHasUnpublishedChanges(true);
      } else {
        setHasUnpublishedChanges(false);
      }
    };

    const draftRef = ref(db, draftLayoutKey);
    const pubRef = ref(db, publishedLayoutKey);

    const unsubscribeDraft = onValue(draftRef, (snapshot) => {
      const data = snapshot.val();
      latestDraft = data ? (Array.isArray(data) ? data : Object.values(data)) : null;
      hasLoadedDraft = true;
      syncStates();
      if (latestDraft) {
        try { localStorage.setItem(`dc_draft_layout_${currentPageId}`, JSON.stringify(latestDraft)); } catch (_) {}
      }
    }, (err) => {
      console.error("Draft read failed:", err);
      hasLoadedDraft = true;
      syncStates();
    });

    const unsubscribePub = onValue(pubRef, (snapshot) => {
      const data = snapshot.val();
      latestPub = data ? (Array.isArray(data) ? data : Object.values(data)) : null;
      hasLoadedPub = true;
      syncStates();
    }, (err) => {
      console.error("Pub read failed:", err);
      hasLoadedPub = true;
      syncStates();
    });

    return () => {
      unsubscribeDraft();
      unsubscribePub();
    };
  }, [currentPageId]);

  // Form states for new product (Shopify detailed layout replica)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    compareAtPrice: '',
    chargeTax: true,
    sku: '',
    barcode: '',
    quantity: '0',
    weight: '0.0',
    weightUnit: 'g',
    status: 'Active',
    category: 'Massage Oil',
    type: 'Wellness Oil',
    vendor: 'Divine Cardinal',
    collections: '',
    tags: '',
    image: '',
    images: [] as string[],
    keyIngredients: '',
    howToUse: '',
    seoTitle: '',
    seoDescription: '',
    slug: '',
    quickFacts: [] as {key: string; value: string}[],
    shortDescription: '',
    keyBenefits: [] as string[],
    ingredientBreakdown: '',
    whoItsFor: '',
    faqs: [] as {question: string; answer: string}[],
    structuredData: '',
    altText: [] as string[],
    internalLinks: [] as string[],
    regulatoryNote: '' as string
  });
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingPlatformLogoIndex, setUploadingPlatformLogoIndex] = useState<number | null>(null);

  const [parsingDoc, setParsingDoc] = useState(false);
  const handleSEODocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingDoc(true);
    try {
      let text = '';
      if (file.name.endsWith('.docx')) {
        // @ts-ignore
        const mammoth = (await import('mammoth')).default || await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer as any });
        text = result.value;
      } else {
        text = await file.text();
      }

      const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
      const response = await fetch(`${API_URL}/ai-builder/parse-seo-doc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: text })
      });
      const data = await response.json();
      if (data.success && data.data) {
        setProductForm(prev => ({
          ...prev,
          seoTitle: data.data.seoTitle || data.data.title || data.data.SEOTitle || prev.seoTitle,
          seoDescription: data.data.seoDescription || data.data.metaDescription || data.data.description || prev.seoDescription,
          slug: data.data.slug || prev.slug,
          title: data.data.title || data.data.seoTitle || data.data.SEOTitle || prev.title,
          description: data.data.longDescription || data.data.description || prev.description,
          quickFacts: (data.data.quickFacts && data.data.quickFacts.length > 0) ? data.data.quickFacts : prev.quickFacts,
          shortDescription: data.data.shortDescription || data.data.seoDescription || prev.shortDescription,
          keyBenefits: (data.data.keyBenefits && data.data.keyBenefits.length > 0) ? data.data.keyBenefits : prev.keyBenefits,
          howToUse: data.data.howToUse || prev.howToUse,
          ingredientBreakdown: data.data.ingredientBreakdown || prev.ingredientBreakdown,
          whoItsFor: data.data.whoItsFor || prev.whoItsFor,
          faqs: (data.data.faqs && data.data.faqs.length > 0) ? data.data.faqs : prev.faqs,
          structuredData: typeof data.data.structuredData === 'string' ? data.data.structuredData : JSON.stringify(data.data.structuredData),
          altText: data.data.altText || prev.altText,
          internalLinks: data.data.internalLinks || prev.internalLinks,
          regulatoryNote: data.data.regulatoryNote || prev.regulatoryNote,
        }));
        alert('SEO Document parsed successfully! All sections (7, 8, 9, 10, 16) were extracted.');
      } else {
        alert(`Failed to parse SEO document: ${data.error || data.message || 'Unknown error from backend'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error parsing document: ${err.message || 'Unknown network error'}`);
    } finally {
      setParsingDoc(false);
    }
  };

  const handlePlatformLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, pIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPlatformLogoIndex(pIdx);
    const API_URL = '/api/backend';
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/cms/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.url) {
          const np = [...editingSection.data.platforms];
          np[pIdx].logo = resData.url;
          setEditingSection({
            ...editingSection,
            data: { ...editingSection.data, platforms: np }
          });
        }
      } else {
        alert('Failed to upload logo');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading logo');
    } finally {
      setUploadingPlatformLogoIndex(null);
    }
  };

  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // AI chat bot mock
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Live analytics counters
  const [liveVisitors, setLiveVisitors] = useState(3);
  const [liveVisitsLog, setLiveVisitsLog] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(1950);
  const [ordersCount, setOrdersCount] = useState(2);
  const [sessionsCount, setSessionsCount] = useState(640);
  const [isSyncing, setIsSyncing] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvMessage, setCsvMessage] = useState<string | null>(null);

  const handleSyncDatabase = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1000);
  };

  // CSV Import Handler - fixed with proper Promise-based FileReader
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a valid .csv file');
      return;
    }
    setCsvImporting(true);
    setCsvMessage(null);

    const readFile = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsText(f);
      });

    readFile(file)
      .then(async (text) => {
        const lines = text.split('\n').filter((l) => l.trim());
        if (lines.length < 2) throw new Error('CSV has no data rows');

        const headers = lines[0]
          .split(',')
          .map((h) => h.trim().toLowerCase().replace(/"/g, ''));

        // Build all products first, then batch-write
        const batchUpdates: Record<string, any> = {};
        let count = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
          if (values.length < 2) continue;
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

          const productId = row['id'] || `csv_${Date.now()}_${i}`;
          const name = row['name'] || row['title'] || 'Unnamed Product';
          batchUpdates[productId] = {
            id: productId,
            name,
            description: row['description'] || '',
            price: Number(row['price'] || row['base_price'] || 0),
            basePrice: Number(row['price'] || row['base_price'] || 0),
            category: row['category'] || 'Uncategorized',
            sku: row['sku'] || '',
            status: row['status'] || 'Active',
            vendor: row['vendor'] || 'Divine Cardinal',
            inventory: Number(row['quantity'] || row['inventory'] || 0),
            images: (row['image'] || row['image_url'])
              ? [{ url: row['image'] || row['image_url'] }]
              : [],
            variants: [{
              id: row['sku'] || productId,
              title: row['variant_title'] || '50ml',
              price: Number(row['price'] || 0),
              sku: row['sku'] || productId,
            }],
            tags: row['tags'] || '',
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          };
          count++;
        }

        if (count === 0) throw new Error('No valid rows found in CSV');

        // Single batch write to Firebase — much faster than one-by-one
        await set(ref(db, 'products'), { ...Object.fromEntries(Object.entries(batchUpdates)) });
        setCsvMessage(`✅ ${count} product${count !== 1 ? 's' : ''} imported successfully!`);
      })
      .catch((err) => {
        console.error('CSV import error:', err);
        setCsvMessage(`❌ Error: ${err.message || 'Could not parse CSV. Check format.'}`);
      })
      .finally(() => {
        setCsvImporting(false);
        e.target.value = '';
      });
  };

  const handleClearDatabase = () => {
    if (window.confirm("Are you sure you want to remove all existing fake orders and products to start with a completely fresh, clean database?")) {
      set(ref(db, 'products'), null);
      set(ref(db, 'orders'), null);
      alert("Database cleared successfully! You can now add your own products from scratch.");
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch(`${API_URL}/cms/upload`, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const resData = await response.json();
          return resData.url || null;
        } else {
          console.error('Failed to upload file:', file.name);
          return null;
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const uploadedUrls = results.filter(url => url !== null) as string[];
    
    if (uploadedUrls.length < files.length) {
      alert('Some files failed to upload.');
    }

    setProductForm(prev => ({
      ...prev,
      images: [...(prev.images || []), ...uploadedUrls],
      image: prev.image || uploadedUrls[0] || ''
    }));
    setUploadingMedia(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title) return;

    const existingProduct = productsList.find(p => p.id === editingProductId) || {};
    let updatedVariants = existingProduct.variants ? [...existingProduct.variants] : [{ id: `var-${editingProductId || Date.now()}`, title: 'Default', price: Number(productForm.price) }];
    if (updatedVariants.length > 0) {
      updatedVariants[0].price = Number(productForm.price) || 0;
      updatedVariants[0].compareAtPrice = Number(productForm.compareAtPrice) || 0;
    }

    const newProductObject = {
      ...existingProduct,
      id: editingProductId || String(Date.now()),
      name: productForm.title,
      description: productForm.description,
      status: productForm.status,
      inventory: productForm.status === 'Active' ? Number(productForm.quantity) : 0,
      price: Number(productForm.price) || 0,
      basePrice: Number(productForm.price) || 0,
      compareAtPrice: Number(productForm.compareAtPrice) || 0,
      variants: updatedVariants,
      sku: productForm.sku || '',
      barcode: productForm.barcode || '',
      weight: Number(productForm.weight) || 0,
      weightUnit: productForm.weightUnit || 'g',
      category: productForm.category,
      type: productForm.type,
      vendor: productForm.vendor || 'Divine Cardinal',
      collections: productForm.collections,
      tags: productForm.tags,
      image: productForm.image || '',
      images: productForm.images || [],
      keyIngredients: productForm.keyIngredients || '',
      howToUse: productForm.howToUse || '',
      seoTitle: productForm.seoTitle || '',
      seoDescription: productForm.seoDescription || '',
      slug: productForm.slug || '',
      quickFacts: productForm.quickFacts || [],
      shortDescription: productForm.shortDescription || '',
      keyBenefits: productForm.keyBenefits || [],
      ingredientBreakdown: productForm.ingredientBreakdown || '',
      whoItsFor: productForm.whoItsFor || '',
      faqs: productForm.faqs || [],
      structuredData: productForm.structuredData || '',
      altText: productForm.altText || [],
      internalLinks: productForm.internalLinks || [],
      regulatoryNote: (productForm as any).regulatoryNote || ''
    };

    try {
      await set(ref(db, `products/${newProductObject.id}`), newProductObject);
      await set(ref(db, `product_extras/${newProductObject.id}`), newProductObject);
      
      // Update local state so changes don't disappear
      setProductsList(prev => {
        const idx = prev.findIndex(p => p.id === newProductObject.id);
        if (idx !== -1) {
          const newList = [...prev];
          newList[idx] = newProductObject;
          return newList;
        }
        return [...prev, newProductObject];
      });

      setIsAddingProduct(false);
      setEditingProductId(null);
      // Reset Form
      setProductForm({
        title: '',
        description: '',
        price: '',
        compareAtPrice: '',
        chargeTax: true,
        sku: '',
        barcode: '',
        quantity: '0',
        weight: '0.0',
        weightUnit: 'g',
        status: 'Active',
        category: "Women's Care",
        type: 'Wellness Oil',
        vendor: 'Divine Cardinal',
        collections: 'Massage Oils',
        tags: '',
        image: '',
        images: [],
        keyIngredients: '',
        howToUse: '',
        seoTitle: '',
        seoDescription: '',
        slug: '',
        quickFacts: [],
        shortDescription: '',
        keyBenefits: [],
        ingredientBreakdown: '',
        whoItsFor: '',
        faqs: [],
        structuredData: '',
        altText: [],
        internalLinks: [],
        regulatoryNote: ''
      });
      alert('Product saved successfully!');
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save product: ${err.message || 'Unknown error'}`);
    }
  };

  const handleEditProduct = (p: any) => {
    const productImages = p.images?.map((img: any) => img.url || img) || (p.image ? [p.image] : []);
    setProductForm({
      title: p.name || '',
      description: p.description || '',
      price: p.price?.toString() || '',
      compareAtPrice: p.compareAtPrice?.toString() || '',
      chargeTax: true,
      sku: p.sku || '',
      barcode: p.barcode || '',
      quantity: p.inventory?.toString() || '0',
      weight: '0.0',
      weightUnit: 'g',
      status: p.status || 'Active',
      category: p.category || "Women's Care",
      type: p.type || 'Wellness Oil',
      vendor: p.vendor || 'Divine Cardinal',
      collections: p.collections || 'Massage Oils',
      tags: p.tags || '',
      image: productImages[0] || '',
      images: productImages,
      keyIngredients: p.keyIngredients || '',
      howToUse: p.howToUse || '',
      seoTitle: p.seoTitle || '',
      seoDescription: p.seoDescription || '',
      slug: p.slug || '',
      quickFacts: p.quickFacts || [],
      shortDescription: p.shortDescription || '',
      keyBenefits: p.keyBenefits || [],
      ingredientBreakdown: p.ingredientBreakdown || '',
      whoItsFor: p.whoItsFor || '',
      faqs: p.faqs || [],
      structuredData: p.structuredData || '',
      altText: p.altText || [],
      internalLinks: p.internalLinks || [],
      regulatoryNote: p.regulatoryNote || ''
    });
    setEditingProductId(p.id);
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      set(ref(db, `products/${id}`), null);
      set(ref(db, `product_extras/${id}`), null);
      setSelectedProductIds(prev => prev.filter(pId => pId !== id));
    }
  };

  const handleBulkDeleteProducts = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProductIds.length} products?`)) {
      selectedProductIds.forEach(id => {
        set(ref(db, `products/${id}`), null);
        set(ref(db, `product_extras/${id}`), null);
      });
      setSelectedProductIds([]);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, statusType: 'paymentStatus' | 'fulfillmentStatus' | 'deliveryStatus', value: string) => {
    const normalizedId = orderId.replace('/', '_');
    const targetOrder = ordersList.find(o => o.id === orderId);
    if (targetOrder) {
      const updatedOrder = { ...targetOrder, [statusType]: value };
      set(ref(db, `orders/${normalizedId}`), updatedOrder);
    }
    if (showOrderDetailModal && showOrderDetailModal.id === orderId) {
      setShowOrderDetailModal({ ...showOrderDetailModal, [statusType]: value });
    }
  };

  const handleApproveReview = (reviewId: string) => {
    set(ref(db, `reviews/${reviewId}/status`), 'approved');
  };

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      set(ref(db, `reviews/${reviewId}`), null);
    }
  };

  const handlePublishLayout = () => {
    if (homepageLayout.length === 0) {
      alert("Cannot publish an empty layout. Please add some sections first.");
      return;
    }
    
    setIsPublishing(true);
    const publishedLayoutKey = getPublishedLayoutKey(currentPageId);
    
    const asObject: Record<string, any> = {};
    homepageLayout.forEach((s) => {
      asObject[s.id] = s;
    });

    set(ref(db, publishedLayoutKey), asObject)
      .then(() => {
        setIsPublishing(false);
        setHasUnpublishedChanges(false);
        alert("🎉 Live layout for page " + currentPageId + " published successfully!");
      })
      .catch((err) => {
        setIsPublishing(false);
        console.error("Publish error:", err);
        alert("Failed to publish layout. Please verify database connection.");
      });
  };

  const handleInitializeLayout = () => {
    const asObject: Record<string, any> = {};
    DEFAULT_HOMEPAGE_LAYOUT.forEach((s: any) => { asObject[s.id] = s; });
    
    const targetLayoutKey = getDraftLayoutKey(currentPageId);
    try { localStorage.setItem(`dc_draft_layout_${currentPageId}`, JSON.stringify(DEFAULT_HOMEPAGE_LAYOUT)); } catch(_) {}
    
    set(ref(db, targetLayoutKey), asObject)
      .then(() => {
        setHasUnpublishedChanges(true);
        alert(`✅ Draft layout initialized for ${currentPageId}!`);
      })
      .catch((err) => {
        console.error('Firebase error:', err);
        alert('✅ Draft layout saved to local cache!');
      });
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sorted = [...homepageLayout].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(s => s.id === sectionId);
    if (idx === -1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const newSorted = sorted.map(s => ({ ...s }));
    const tmpOrder = newSorted[idx].order;
    newSorted[idx].order = newSorted[swapIdx].order;
    newSorted[swapIdx].order = tmpOrder;

    const reindexed = newSorted
      .sort((a, b) => a.order - b.order)
      .map((s, i) => ({ ...s, order: i + 1 }));

    setHomepageLayout(reindexed);

    try { localStorage.setItem(`dc_draft_layout_${currentPageId}`, JSON.stringify(reindexed)); } catch(_) {}

    const asObject: Record<string, any> = {};
    reindexed.forEach(s => { asObject[s.id] = s; });
    const targetLayoutKey = getDraftLayoutKey(currentPageId);
                                       set(ref(db, targetLayoutKey), asObject);
                                       setHasUnpublishedChanges(true);
    setHasUnpublishedChanges(true);
  };

  const handleAddPredefinedSection = (template: any) => {
    const newSection = {
      ...template,
      id: `${template.id}_${Date.now()}`,
      order: homepageLayout.length + 1
    };
    const newLayout = [...homepageLayout, newSection];
    
    // Optimistic UI updates
    setHomepageLayout(newLayout);
    try { localStorage.setItem(`dc_draft_layout_${currentPageId}`, JSON.stringify(newLayout)); } catch (_) {}
    setShowAddSectionModal(false);
    
    const asObject: Record<string, any> = {};
    newLayout.forEach(s => { asObject[s.id] = s; });
    const targetLayoutKey = getDraftLayoutKey(currentPageId);
    
    set(ref(db, targetLayoutKey), asObject)
      .then(() => setHasUnpublishedChanges(true))
      .catch((err) => {
        console.error("Firebase sync error on adding section:", err);
      });
  };

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageForm.title || !newPageForm.slug) return;
    
    // basic slugify
    let slug = newPageForm.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const newPage = {
      id: slug,
      slug: slug,
      title: newPageForm.title,
      createdAt: Date.now()
    };
    
    set(ref(db, `pages_registry/${slug}`), newPage).then(() => {
      setPagesRegistry(prev => {
        if (!prev.find(p => p.id === slug)) {
          return [...prev, newPage];
        }
        return prev;
      });
      setTimeout(() => {
        setShowCreatePageModal(false);
        setCurrentPageId(slug);
        setNewPageForm({ title: '', slug: '' });
        alert(`Page "${newPage.title}" created successfully!`);
      }, 50);
    });
  };

  const [isAiLoading, setIsAiLoading] = useState(false);

  const runAiInsight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery || isAiLoading) return;
    setIsAiLoading(true);
    setAiResponse('Thinking...');

    try {
      // Build a simple store context
      const paidSales = ordersList.filter(o => o.paymentStatus === 'Paid');
      const totalRevenue = paidSales.reduce((acc, o) => acc + o.total, 0);
      const storeContext = `Products: ${productsList.length} total.
Orders: ${ordersList.length} total, ${paidSales.length} paid.
Total Revenue: ₹${totalRevenue}.
Customers: ${customersList.length} total.`;

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery, storeContext })
      });
      const data = await res.json();
      
      if (res.ok && data.reply) {
        setAiResponse(data.reply);
      } else {
        setAiResponse(`Error: ${data.error || 'Please check API settings.'}`);
      }
    } catch (err) {
      setAiResponse('Network error. Failed to reach AI service.');
    }
    setIsAiLoading(false);
  };

  // Filtered lists
  const filteredProducts = productsList.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  const filteredOrders = ordersList.filter(o => o.customer.toLowerCase().includes(orderSearch.toLowerCase()) || o.id.toLowerCase().includes(orderSearch.toLowerCase()));
  const filteredCustomers = customersList.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.email.toLowerCase().includes(customerSearch.toLowerCase()));

  const currentProduct = currentPageId?.startsWith('product-')
    ? productsList.find(p => p.slug === currentPageId.replace('product-', ''))
    : null;

  const mockProductForClient = currentProduct ? {
    ...currentProduct,
    rating: Number(currentProduct.rating) || 5.0,
    categories: [{ name: currentProduct.category || 'Uncategorized' }],
    variants: [
      { id: currentProduct.sku || 'default', title: 'Default', price: currentProduct.price || 0, sku: currentProduct.sku || '' }
    ],
    images: [{ url: currentProduct.image || '' }],
    faqs: [],
    reviews: []
  } : null;

  return (
    <div className="min-h-screen bg-[#F1F1F1] text-[#303030] font-sans antialiased relative">
      {/* 1. KALVIX Nexus Top Dark Navbar */}
      <nav className="bg-[#1A1A1A] h-14 px-2 sm:px-4 flex items-center justify-between text-white border-b border-black select-none z-50 relative">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button 
            className="md:hidden p-1 hover:bg-[#303030] rounded text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center overflow-hidden rounded bg-white">
            <img src="https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnBLEJ5ZaAwjxRdQTUxo2XwZaUTkJC22l_-T8nFyWz0XQ9I_TogwHnRJ19jAUIdKuL0WNtA1wcSeepi9yiediDM4a0DmeSBi_ZoaTVP1ajkNxBfIC_5PEpBYOR-iiZxmjrBXKI_cdwPq7ir=s1360-w1360-h1020-rw" alt="Kalvix Nexus Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-serif font-semibold text-xs sm:text-sm tracking-widest uppercase">KALVIX Nexus</span>
          <span className="hidden sm:inline-block bg-[#2a2a2a] text-gray-400 text-[10px] px-1.5 py-0.5 rounded font-mono">Nexus OS v2.0</span>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-md w-full mx-4 hidden lg:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search store dashboard..." 
            className="w-full bg-[#303030] border border-[#424242] focus:outline-none focus:border-[#008060] rounded-md pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-400"
          />
        </div>

        {/* User Workspace indicator */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            type="button"
            onClick={handleSyncDatabase}
            disabled={isSyncing}
            className="flex items-center space-x-1 sm:space-x-1.5 bg-[#303030] hover:bg-[#424242] border border-luxury-gold/30 text-white px-2 py-1.5 sm:px-3 rounded text-[10px] uppercase font-sans tracking-wider font-semibold transition-all"
          >
            <RefreshCw className={`h-3 w-3 text-luxury-gold ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline-block">{isSyncing ? 'Syncing...' : 'Sync Live DB'}</span>
          </button>
          <div className="hidden md:block bg-gradient-to-r from-luxury-gold to-yellow-600 px-2.5 py-1 rounded text-[10px] tracking-widest uppercase font-serif text-white font-medium shadow-md truncate max-w-[150px] lg:max-w-none">
            DIVINE CARDINAL INTERN...
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('kalvix_user');
              window.location.reload();
            }}
            className="text-[10px] text-gray-400 hover:text-white uppercase tracking-widest"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* 2. Left Gray Sidebar */}
        <aside className={`w-60 bg-[#EBEBEB] border-r border-[#D2D2D2] flex flex-col justify-between py-4 text-xs font-medium text-[#4a4a4a] select-none absolute md:relative z-40 h-full transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="space-y-1 overflow-y-auto">
            <button 
              onClick={() => { setActiveTab('home'); setIsAddingProduct(false); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-[#E1E1E1] border-l-3 ${activeTab === 'home' && !isAddingProduct ? 'border-[#008060] bg-[#E1E1E1] text-[#1a1a1a] font-bold' : 'border-transparent'}`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </button>
            <button 
              onClick={() => { setActiveTab('orders'); setIsAddingProduct(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-[#E1E1E1] border-l-3 ${activeTab === 'orders' ? 'border-[#008060] bg-[#E1E1E1] text-[#1a1a1a] font-bold' : 'border-transparent'}`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Orders</span>
            </button>
            <button 
              onClick={() => { setActiveTab('products'); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-[#E1E1E1] border-l-3 ${activeTab === 'products' ? 'border-[#008060] bg-[#E1E1E1] text-[#1a1a1a] font-bold' : 'border-transparent'}`}
            >
              <Package className="h-4 w-4" />
              <span>Products</span>
            </button>
            <button 
              onClick={() => { setActiveTab('customers'); setIsAddingProduct(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-[#E1E1E1] border-l-3 ${activeTab === 'customers' ? 'border-[#008060] bg-[#E1E1E1] text-[#1a1a1a] font-bold' : 'border-transparent'}`}
            >
              <Users className="h-4 w-4" />
              <span>Customers</span>
            </button>
            <button 
              onClick={() => { setActiveTab('analytics'); setIsAddingProduct(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-[#E1E1E1] border-l-3 ${activeTab === 'analytics' ? 'border-[#008060] bg-[#E1E1E1] text-[#1a1a1a] font-bold' : 'border-transparent'}`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </button>
            <button 
              onClick={() => { setActiveTab('reviews'); setIsAddingProduct(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-[#E1E1E1] border-l-3 ${activeTab === 'reviews' ? 'border-[#008060] bg-[#E1E1E1] text-[#1a1a1a] font-bold' : 'border-transparent'}`}
            >
              <Star className="h-4 w-4" />
              <span>Reviews</span>
            </button>
            <button 
              onClick={() => { setActiveTab('theme_store'); setIsAddingProduct(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-[#E1E1E1] border-l-3 ${activeTab === 'theme_store' ? 'border-[#008060] bg-[#E1E1E1] text-[#1a1a1a] font-bold' : 'border-transparent text-[#616161] hover:text-[#1a1a1a]'}`}
            >
              <LayoutTemplate className={`h-4 w-4 ${activeTab === 'theme_store' ? 'text-[#008060]' : 'text-[#616161]'}`} />
              <span>Theme Store</span>
            </button>
            <button 
              onClick={() => { setActiveTab('store'); setIsAddingProduct(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-[#E1E1E1] border-l-3 ${activeTab === 'store' ? 'border-[#008060] bg-[#E1E1E1] text-[#1a1a1a] font-bold' : 'border-transparent text-[#616161] hover:text-[#1a1a1a]'}`}
            >
              <Monitor className={`h-4 w-4 ${activeTab === 'store' ? 'text-[#008060]' : 'text-[#616161]'}`} />
              <span>Online Store (CMS)</span>
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-[#E1E1E1] border-l-3 ${activeTab === 'filters' ? 'border-[#008060] bg-[#E1E1E1] text-[#1a1a1a] font-bold' : 'border-transparent'}`}
            >
              <Filter className="h-4 w-4" />
              <span>Shop Filters</span>
            </button>
            <button
              onClick={() => setActiveTab('global_ui')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-[#E1E1E1] border-l-3 ${activeTab === 'global_ui' ? 'border-[#008060] bg-[#E1E1E1] text-[#1a1a1a] font-bold' : 'border-transparent'}`}
            >
              <Layout className="h-4 w-4" />
              <span>Global UI</span>
            </button>
            <button 
              onClick={() => { setActiveTab('ingredients'); setIsAddingProduct(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-[#E1E1E1] border-l-3 ${activeTab === 'ingredients' ? 'border-[#008060] bg-[#E1E1E1] text-[#1a1a1a] font-bold' : 'border-transparent'}`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Ingredients Glossary</span>
            </button>
            <button 
              onClick={() => { setActiveTab('storage'); setIsAddingProduct(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-[#E1E1E1] border-l-3 ${activeTab === 'storage' ? 'border-[#008060] bg-[#E1E1E1] text-[#1a1a1a] font-bold' : 'border-transparent'}`}
            >
              <Folder className="h-4 w-4" />
              <span>Storage</span>
            </button>
            <button 
              onClick={() => setActiveTab('discounts')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors font-medium ${
                activeTab === 'discounts' ? 'bg-[#F1F1F1] text-black font-semibold' : 'text-[#616161] hover:bg-[#F1F1F1] hover:text-black'
              }`}
            >
              <Tag className="h-4 w-4" />
              <span>Discounts</span>
            </button>

            <button 
              onClick={() => setActiveTab('seo')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors font-medium ${
                activeTab === 'seo' ? 'bg-[#F1F1F1] text-black font-semibold' : 'text-[#616161] hover:bg-[#F1F1F1] hover:text-black'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>SEO Console</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('integrations')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors font-medium ${
                activeTab === 'integrations' ? 'bg-[#F1F1F1] text-black font-semibold' : 'text-[#616161] hover:bg-[#F1F1F1] hover:text-black'
              }`}
            >
              <Link2 className="h-4 w-4" />
              <span>Integrations</span>
            </button>
          </div>

          <div className="px-4 py-4 border-t border-[#D2D2D2] space-y-3">
            <div className="flex items-center justify-between text-gray-500 text-[10px] uppercase tracking-wider">
              <span>Sales Channels</span>
            </div>
            <Link href="/" className="flex items-center space-x-3 text-gray-700 hover:text-black">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Online Store</span>
            </Link>
          </div>
        </aside>

        {/* 3. Main Content Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar">
          
          {/* SPECIAL SCREEN: ADD PRODUCT (Shopify Detailed 2-column clone) */}
          {isAddingProduct ? (
            <form onSubmit={handleSaveProduct} className="space-y-6 max-w-5xl text-xs">
              {/* Header Actions row */}
              <div className="flex items-center justify-between border-b border-gray-300 pb-4">
                <div className="flex items-center space-x-3">
                  <button 
                    type="button" 
                    onClick={() => { setIsAddingProduct(false); setEditingProductId(null); }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Products &gt; {editingProductId ? 'Edit' : 'Add'}</span>
                    <h1 className="text-xl font-bold font-sans text-[#1A1A1A]">{editingProductId ? 'Edit product' : 'Add product'}</h1>
                  </div>
                </div>
                
                <div className="flex space-x-3 items-center">
                  <input type="file" id="seo-doc-upload" accept=".txt,.md,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleSEODocUpload} />
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('seo-doc-upload')?.click()}
                    className="bg-[#E1E1E1] hover:bg-[#D1D1D1] text-[#1A1A1A] px-4 py-1.5 rounded-md font-medium text-sm flex items-center space-x-2"
                    disabled={parsingDoc}
                  >
                    <FileText className="w-4 h-4" />
                    <span>{parsingDoc ? 'Parsing...' : 'Upload SEO Doc'}</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setIsAddingProduct(false); setEditingProductId(null); }}
                    className="bg-white border border-[#CCCCCC] hover:border-black text-gray-700 px-4 py-1.5 rounded-md font-medium"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit" 
                    className="bg-[#008060] hover:bg-[#006e52] text-white px-5 py-1.5 rounded-md font-semibold shadow-sm"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Main Content: 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Left Column (Main details - 2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Title & Description card */}
                  <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700 block">Title</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Short sleeve t-shirt, Chamomile Balm..."
                        value={productForm.title}
                        onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                        className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 text-xs focus:border-[#008060] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700 block">Short Description</label>
                      <input 
                        type="text" 
                        placeholder="A brief summary for the top of the product page..."
                        value={productForm.shortDescription}
                        onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                        className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 text-xs focus:border-[#008060] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700 block">Description</label>
                      <RichTextEditor 
                        value={productForm.description}
                        onChange={(val) => setProductForm({ ...productForm, description: val })}
                        minHeight="200px"
                        placeholder="Write Ayurvedic ingredients list, benefits and application rituals..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">Key Ingredients (Comma separated)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Neem, Jojoba, Sandalwood"
                        value={productForm.keyIngredients}
                        onChange={(e) => setProductForm({ ...productForm, keyIngredients: e.target.value })}
                        className="w-full bg-white border border-[#CCCCCC] focus:outline-none focus:border-luxury-gold rounded px-3 py-2 text-xs font-sans"
                      />
                      <p className="text-[10px] text-gray-500">These will be used for the Ingredient Filter in the Shop page.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">How to Use (Concerns)</label>
                      <RichTextEditor 
                        value={productForm.howToUse}
                        onChange={(val) => setProductForm({ ...productForm, howToUse: val })}
                        minHeight="150px"
                        placeholder="e.g. Apply for Dandruff and Hair Fall..."
                      />
                      <p className="text-[10px] text-gray-500">Mentions of concerns (e.g. Dandruff) here will trigger the Concern Filter.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">Ingredient Breakdown</label>
                      <RichTextEditor 
                        value={productForm.ingredientBreakdown}
                        onChange={(val) => setProductForm({ ...productForm, ingredientBreakdown: val })}
                        minHeight="200px"
                        placeholder="Type ingredients here in plain text. Format: Heading on one line, description on the next."
                      />
                      <p className="text-[10px] text-gray-500">Just type plain text! The website will automatically detect headings, make them bold, and generate clickable links for you.</p>
                    </div>
                  </div>

                  {/* Advanced SEO Data card */}
                  <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-gray-700">Advanced SEO Data</label>
                      <span className="text-[10px] bg-[#008060]/10 text-[#008060] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Auto-filled</span>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">SEO Title Tag</label>
                      <input 
                        type="text" 
                        value={productForm.seoTitle}
                        onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                        className="w-full bg-white border border-[#CCCCCC] focus:outline-none focus:border-luxury-gold rounded px-3 py-2 text-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">Meta Description</label>
                      <textarea 
                        rows={2}
                        value={productForm.seoDescription}
                        onChange={(e) => setProductForm({ ...productForm, seoDescription: e.target.value })}
                        className="w-full bg-white border border-[#CCCCCC] focus:outline-none focus:border-luxury-gold rounded px-3 py-2 text-xs font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700">URL Slug</label>
                      <input 
                        type="text" 
                        value={productForm.slug}
                        onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                        className="w-full bg-white border border-[#CCCCCC] focus:outline-none focus:border-luxury-gold rounded px-3 py-2 text-xs font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700">Quick Facts ({productForm.quickFacts?.length || 0})</label>
                        <div className="bg-gray-50 border border-gray-200 p-2 rounded text-[10px] text-gray-600 max-h-32 overflow-y-auto">
                          {productForm.quickFacts?.length > 0 ? (
                            productForm.quickFacts.map((qf, i) => <div key={i}><strong className="text-black">{qf.key}:</strong> {qf.value}</div>)
                          ) : 'No quick facts available.'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700">FAQs ({productForm.faqs?.length || 0})</label>
                        <div className="bg-gray-50 border border-gray-200 p-2 rounded text-[10px] text-gray-600 max-h-32 overflow-y-auto">
                          {productForm.faqs?.length > 0 ? (
                            productForm.faqs.map((faq, i) => <div key={i} className="mb-1"><strong className="text-black block">Q: {faq.question}</strong> A: {faq.answer}</div>)
                          ) : 'No FAQs available.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Media uploads card */}
                  <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="font-semibold text-gray-700">Media</label>
                      {uploadingMedia && (
                        <span className="text-xs text-luxury-gold animate-pulse flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-luxury-gold inline-block animate-ping"></span>
                          Uploading to Cloudinary...
                        </span>
                      )}
                    </div>
                       <input 
                      type="file" 
                      multiple
                      accept=".tiff,.jpg,.png,.jpeg,.pdf,.mp4,.mov,.webm,image/*,video/*,application/pdf" 
                      className="hidden" 
                      id="media-upload-input" 
                      onChange={handleMediaUpload}
                    />

                    {/* Preview Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {(productForm.images || []).map((imgUrl, idx) => {
                        const isPdf = imgUrl.toLowerCase().endsWith('.pdf') || imgUrl.toLowerCase().includes('mimetype=application/pdf');
                        const isVideo = imgUrl.toLowerCase().endsWith('.mp4') || imgUrl.toLowerCase().includes('/video/upload/') || imgUrl.toLowerCase().includes('.mov') || imgUrl.toLowerCase().includes('.webm');
                        return (
                          <div key={idx} className="relative group border border-gray-200 rounded-lg overflow-hidden h-28 bg-gray-50 flex items-center justify-center shadow-sm">
                            {isVideo ? (
                              <video src={imgUrl} className="h-full w-full object-cover animate-fade-in" controls muted />
                            ) : isPdf ? (
                              <div className="flex flex-col items-center justify-center p-2 text-center">
                                <FileText className="h-8 w-8 text-red-500 mb-1 animate-fade-in" />
                                <span className="text-[9px] text-gray-500 truncate max-w-[80px]">PDF Document</span>
                              </div>
                            ) : (
                              <img src={imgUrl} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover animate-fade-in" />
                            )}
                            
                            {/* Badges */}
                            {idx === 0 && (
                              <span className="absolute top-1 left-1 bg-[#008060] text-white text-[8px] font-semibold px-1.5 py-0.5 rounded shadow-sm">
                                Primary
                              </span>
                            )}
                            
                            {/* Delete button */}
                            <button 
                              type="button"
                              onClick={() => {
                                const newImages = productForm.images.filter((_, i) => i !== idx);
                                setProductForm({ 
                                  ...productForm, 
                                  images: newImages, 
                                  image: newImages[0] || '' 
                                });
                              }}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                            >
                              <X className="h-3 w-3" />
                            </button>

                            {/* Position Reordering Actions */}
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  title="Move Left"
                                  onClick={() => {
                                    const newImages = [...productForm.images];
                                    const temp = newImages[idx];
                                    newImages[idx] = newImages[idx - 1];
                                    newImages[idx - 1] = temp;
                                    setProductForm({ 
                                      ...productForm, 
                                      images: newImages, 
                                      image: newImages[0] || '' 
                                    });
                                  }}
                                  className="text-white hover:text-luxury-gold text-xs font-bold px-1"
                                >
                                  ←
                                </button>
                              )}
                              {idx < productForm.images.length - 1 && (
                                <button
                                  type="button"
                                  title="Move Right"
                                  onClick={() => {
                                    const newImages = [...productForm.images];
                                    const temp = newImages[idx];
                                    newImages[idx] = newImages[idx + 1];
                                    newImages[idx + 1] = temp;
                                    setProductForm({ 
                                      ...productForm, 
                                      images: newImages, 
                                      image: newImages[0] || '' 
                                    });
                                  }}
                                  className="text-white hover:text-luxury-gold text-xs font-bold px-1"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Add Image Card */}
                      <div 
                        onClick={() => document.getElementById('media-upload-input')?.click()}
                        className="border-2 border-dashed border-[#CCCCCC] hover:border-luxury-gold/50 rounded-lg h-28 text-center bg-[#FAF9F6]/50 flex flex-col items-center justify-center cursor-pointer transition-colors p-2"
                      >
                        <Upload className="h-4 w-4 text-luxury-gold mb-1" />
                        <span className="text-[10px] text-luxury-gold font-semibold">Upload More</span>
                        <span className="text-[8px] text-gray-400">TIFF, JPG, PNG, PDF</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Selector */}
                  <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-2">
                    <label className="font-semibold text-gray-700 block">Category</label>
                    <select 
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 bg-white outline-none focus:border-[#008060]"
                    >
                      <option value="Women's Care">Women's Care</option>
                      <option value="Wellness Category">Wellness Category</option>
                      <option value="MOTHER Care">MOTHER Care</option>
                      <option value="Men Care">Men Care</option>
                      <option value="Hair Care">Hair Care</option>
                      <option value="Face and Body">Face and Body</option>
                      <option value="Face & Body">Face & Body</option>
                      <option value="Fragrance & Attars">Fragrance & Attars</option>
                      <option value="Attar and Toners">Attar and Toners</option>
                      <option value="Baby Care Range">Baby Care Range</option>
                      <option value="Uncategorized">Uncategorized</option>
                    </select>
                    <p className="text-[10px] text-gray-400">Determines tax rates and adds metafields to improve search discovery.</p>
                  </div>

                  {/* Pricing card */}
                  <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-700 block border-b border-[#FAF9F6] pb-2">Pricing</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 block">Price (INR)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                          <input 
                            type="number" 
                            required
                            placeholder="0.00"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            className="w-full border border-[#CCCCCC] rounded-md pl-7 pr-3 py-2 outline-none focus:border-[#008060]"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 block">Compare-at price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-400">₹</span>
                          <input 
                            type="number" 
                            placeholder="0.00"
                            value={productForm.compareAtPrice}
                            onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
                            className="w-full border border-[#CCCCCC] rounded-md pl-7 pr-3 py-2 outline-none focus:border-[#008060]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 text-[10px] text-gray-600">
                      <input 
                        type="checkbox" 
                        id="tax"
                        checked={productForm.chargeTax}
                        onChange={(e) => setProductForm({ ...productForm, chargeTax: e.target.checked })}
                        className="rounded border-[#CCCCCC] text-[#008060] focus:ring-0"
                      />
                      <label htmlFor="tax" className="cursor-pointer">Charge tax on this product</label>
                    </div>
                  </div>

                  {/* Inventory card */}
                  <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-700 block border-b border-[#FAF9F6] pb-2">Inventory</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 block">SKU (Stock Keeping Unit)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. DC-MASS-LAV-50ML"
                          value={productForm.sku}
                          onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                          className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 outline-none focus:border-[#008060]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 block">Barcode (ISBN, UPC, GTIN)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 89012345678"
                          value={productForm.barcode}
                          onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                          className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 outline-none focus:border-[#008060]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="font-semibold text-gray-700 block">Quantity</label>
                      <div className="flex items-center justify-between bg-[#FAF9F6] border border-[#CCCCCC] rounded-md p-3">
                        <span className="text-[10px] text-gray-600 font-serif">Divine Cardinal International Warehouse</span>
                        <input 
                          type="number" 
                          value={productForm.quantity}
                          onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                          className="w-20 text-center border border-[#CCCCCC] bg-white rounded py-1 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (Sidebar panels - 1 col) */}
                <div className="space-y-6">
                  {/* Status Box */}
                  <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-2">
                    <label className="font-semibold text-gray-700 block">Status</label>
                    <select 
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                      className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 bg-white outline-none focus:border-[#008060]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Publishing Channels */}
                  <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-3">
                    <h3 className="font-semibold text-gray-700 block border-b border-[#FAF9F6] pb-2">Publishing</h3>
                    <ul className="space-y-2 text-gray-500 text-[10px]">
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>Online Store storefront</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        <span>AI Search indexer schema</span>
                      </li>
                    </ul>
                  </div>

                  {/* Product Organization */}
                  <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-700 block border-b border-[#FAF9F6] pb-2">Product organization</h3>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 block">Product category type</label>
                      <input 
                        type="text"
                        placeholder="e.g. Wellness Oil"
                        value={productForm.type}
                        onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                        className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 outline-none focus:border-[#008060]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 block">Vendor</label>
                      <input 
                        type="text"
                        placeholder="e.g. Divine Cardinal"
                        value={productForm.vendor}
                        onChange={(e) => setProductForm({ ...productForm, vendor: e.target.value })}
                        className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 outline-none focus:border-[#008060]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 block">Collections</label>
                      <input 
                        type="text"
                        placeholder="e.g. Massage Oils, Baby Care"
                        value={productForm.collections}
                        onChange={(e) => setProductForm({ ...productForm, collections: e.target.value })}
                        className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 outline-none focus:border-[#008060]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 block">Tags</label>
                      <input 
                        type="text"
                        placeholder="e.g. pain, rose, herbal"
                        value={productForm.tags}
                        onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                        className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 outline-none focus:border-[#008060]"
                      />
                    </div>
                  </div>

                  {/* Theme template selection */}
                  <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-2">
                    <label className="font-semibold text-gray-700 block">Theme template</label>
                    <select className="w-full border border-[#CCCCCC] rounded-md px-3 py-2 bg-white outline-none">
                      <option>Default product template</option>
                      <option>Ayurvedic Story Page template</option>
                    </select>
                  </div>
                </div>

              </div>
            </form>
          ) : (
            <>
              {/* TAB 1: HOME (OVERVIEW) */}
              {activeTab === 'home' && (
                <div className="space-y-6 max-w-5xl">
                  {/* Top Mini Metrics Row */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-white border border-[#D2D2D2] rounded-lg p-4 shadow-sm">
                    <div className="border-r border-gray-200 pr-4">
                      <span className="text-[10px] text-gray-500 uppercase font-sans">Sessions</span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="font-semibold text-base">{sessionsCount}</span>
                        <span className="text-[9px] text-red-500 flex items-center"><TrendingDown className="h-2.5 w-2.5 mr-0.5" /> -10%</span>
                      </div>
                    </div>
                    <div className="border-r border-gray-200 px-2 md:px-4">
                      <span className="text-[10px] text-gray-500 uppercase font-sans">Total Sales</span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="font-semibold text-base">₹{totalSales.toLocaleString('en-IN')}</span>
                        <span className="text-[9px] text-green-600 flex items-center"><TrendingUp className="h-2.5 w-2.5 mr-0.5" /> +129%</span>
                      </div>
                    </div>
                    <div className="border-r border-gray-200 px-2 md:px-4">
                      <span className="text-[10px] text-gray-500 uppercase font-sans">Orders</span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="font-semibold text-base">{ordersCount}</span>
                        <span className="text-[9px] text-green-600 flex items-center"><TrendingUp className="h-2.5 w-2.5 mr-0.5" /> +100%</span>
                      </div>
                    </div>
                    <div className="border-r border-gray-200 px-2 md:px-4">
                      <span className="text-[10px] text-gray-500 uppercase font-sans">Conversion Rate</span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="font-semibold text-base">{((ordersCount / sessionsCount) * 100).toFixed(2)}%</span>
                        <span className="text-[9px] text-green-600 flex items-center"><TrendingUp className="h-2.5 w-2.5 mr-0.5" /> +121%</span>
                      </div>
                    </div>
                    <div className="px-2 md:px-4">
                      <span className="text-[10px] text-gray-500 uppercase font-sans">Live Visitors</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="font-semibold text-base text-green-600">{liveVisitors}</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Welcome Message */}
                  <div className="bg-white border border-[#D2D2D2] rounded-lg p-6 shadow-sm space-y-6 relative overflow-hidden">
                    <div className="max-w-xl space-y-3">
                      <h2 className="font-serif text-xl tracking-wide text-[#1A1A1A]">Hey there! Let's continue growing your business.</h2>
                      <p className="text-xs text-gray-500 leading-relaxed font-sans font-light">
                        Analyze sales, check inventory levels, fulfill open customer order kits, or generate smart AI insights using the Divine Cardinal copilot panel.
                      </p>
                    </div>

                    {/* AI Search Co-Pilot */}
                    <div className="bg-[#FAF9F6] border border-luxury-gold/20 rounded-lg p-4 max-w-2xl space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-serif text-luxury-gold font-medium">
                        <Sparkles className="h-4 w-4" />
                        <span>Ayurvedic Store Intelligence Co-Pilot</span>
                      </div>

                      <form onSubmit={runAiInsight} className="flex items-center space-x-2">
                        <input 
                          type="text" 
                          placeholder="Ask anything (e.g. sales trends, best products, active conversions)..." 
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          className="flex-1 bg-white border border-[#CCCCCC] focus:outline-none focus:border-luxury-gold rounded-md px-3 py-2 text-xs"
                        />
                        <button 
                          type="submit" 
                          className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md text-xs font-sans uppercase tracking-widest font-medium"
                        >
                          Ask
                        </button>
                      </form>

                      {aiResponse && (
                        <div className="mt-3 p-3 bg-white border-l-3 border-luxury-gold text-xs leading-relaxed text-[#4A4A4A] rounded-r-md">
                          {aiResponse}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid cards templates */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
                      <span className="text-[10px] tracking-widest uppercase font-serif text-luxury-gold">Nexus OS Editions</span>
                      <h3 className="font-serif text-sm font-semibold">Spring '26 Updates</h3>
                      <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                        150+ updates to build, sell, shop, and expand. Integrates AI intelligence and headless checkout pipelines.
                      </p>
                      <button onClick={() => window.open('https://github.com/shourya2510003-d-sys', '_blank')} className="text-[10px] uppercase border border-gray-300 hover:border-black px-4 py-1.5 text-xs tracking-wider transition-colors font-medium">
                        Explore Updates
                      </button>
                    </div>

                    <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
                      <span className="text-[10px] tracking-widest uppercase font-serif text-luxury-gold">Content Health</span>
                      <h3 className="font-serif text-sm font-semibold">Unpublished Page Alerts</h3>
                      <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                        Several product detail routes are in Draft mode and invisible to AI indexers.
                      </p>
                      <button onClick={() => setActiveTab('products')} className="text-[10px] uppercase border border-gray-300 hover:border-black px-4 py-1.5 text-xs tracking-wider transition-colors font-medium">
                        Manage Drafts
                      </button>
                    </div>

                    <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
                      <span className="text-[10px] tracking-widest uppercase font-serif text-luxury-gold">FAQ Console</span>
                      <h3 className="font-serif text-sm font-semibold">Populate FAQ Page</h3>
                      <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                        Adding structured FAQ schemas on your store can increase search conversion click-throughs by up to 22%.
                      </p>
                      <button onClick={() => setActiveTab('global_ui')} className="text-[10px] uppercase border border-gray-300 hover:border-black px-4 py-1.5 text-xs tracking-wider transition-colors font-medium">
                        Edit FAQs
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-6 max-w-5xl text-xs">
                  <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold font-sans">Orders</h1>
                    <div className="flex space-x-2">
                      <button className="bg-white border border-[#CCCCCC] hover:border-black px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5">
                        <Download className="h-3.5 w-3.5" />
                        <span>Export</span>
                      </button>
                      <button className="bg-black text-white hover:bg-gray-800 px-4 py-1.5 rounded-md text-xs font-medium">
                        Create order
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-white border border-[#D2D2D2] rounded-lg p-4 shadow-sm">
                    <div>
                      <span className="text-gray-500 block">Orders</span>
                      <span className="font-bold text-sm block mt-1">{ordersList.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Items ordered</span>
                      <span className="font-bold text-sm block mt-1">9 items</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Returns</span>
                      <span className="font-bold text-sm block mt-1">₹0</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Orders fulfilled</span>
                      <span className="font-bold text-sm block mt-1">{ordersList.filter(o => o.fulfillmentStatus === 'Fulfilled').length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Orders delivered</span>
                      <span className="font-bold text-sm block mt-1">{ordersList.filter(o => o.deliveryStatus === 'Delivered').length}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-[#D2D2D2] rounded-lg shadow-sm">
                    <div className="p-4 border-b border-[#EAEAEA] flex items-center space-x-4">
                      <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search orders..." 
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                          className="w-full bg-[#FAF9F6] border border-[#CCCCCC] focus:outline-none focus:border-luxury-gold rounded-md pl-8 pr-4 py-1.5 text-xs placeholder-gray-400"
                        />
                      </div>
                      <button className="bg-white border border-[#CCCCCC] hover:border-black px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5">
                        <Filter className="h-3.5 w-3.5" />
                        <span>Filter</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#FAF9F6] border-b border-[#EAEAEA] text-gray-500 uppercase tracking-wider text-[9px]">
                            <th className="p-4"><input type="checkbox" /></th>
                            <th className="p-4">Order</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Total</th>
                            <th className="p-4">Payment</th>
                            <th className="p-4">Fulfillment</th>
                            <th className="p-4">Delivery</th>
                            <th className="p-4">Items</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAEAEA]">
                          {filteredOrders.map(o => (
                            <tr 
                              key={o.id} 
                              onClick={() => setShowOrderDetailModal(o)}
                              className="hover:bg-[#FAF9F6] cursor-pointer"
                            >
                              <td className="p-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                              <td className="p-4 font-semibold text-[#008060]">{o.id}</td>
                              <td className="p-4">{o.date}</td>
                              <td className="p-4 font-medium">{o.customer}</td>
                              <td className="p-4">₹{o.total.toFixed(2)}</td>
                              <td className="p-4">
                                <span className="bg-[#E3F2FD] text-[#0D47A1] text-[9px] uppercase px-2 py-0.5 rounded-full font-bold">
                                  {o.paymentStatus}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
                                  o.fulfillmentStatus === 'Fulfilled' ? 'bg-[#E8F5E9] text-[#1B5E20]' : 'bg-[#FFF3E0] text-[#E65100]'
                                }`}>
                                  {o.fulfillmentStatus}
                                </span>
                              </td>
                              <td className="p-4">
                        <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
                                  o.deliveryStatus === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                                }`}>
                                  {o.deliveryStatus}
                                </span>
                              </td>
                              <td className="p-4 text-gray-500">
                                {o.cartItems && o.cartItems.length > 0 ? (
                                  <div className="flex flex-col gap-2">
                                    {o.cartItems.map((item: any, i: number) => (
                                      <div key={i} className="text-[10px] leading-tight max-w-[180px]">
                                        <div className="font-semibold text-black truncate" title={item.name}>{item.name}</div>
                                        <div className="flex items-center mt-0.5 space-x-1">
                                          {item.sku && <span className="text-gray-400 bg-gray-50 px-1 py-0.5 rounded text-[8px] border border-gray-100">{item.sku}</span>}
                                          <span className="text-gray-600 font-medium">x{item.quantity}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  o.items
                                )}
                              </td>
                              <td className="p-4 text-right flex justify-end space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const msg = `Hi ${o.customer}, your order ${o.id} has been confirmed. Total: ₹${o.total}. Payment: ${o.paymentStatus}. We will notify you once it's shipped!`;
                                    // Extract digits from a hypothetical phone field, or default to a test number. 
                                    // Note: we don't have phone in ordersList directly shown here, so we might need to rely on the customer object.
                                    // Assuming o.phone or fallback
                                    const phone = (o.phone || '').replace(/\D/g, '');
                                    const waUrl = `https://wa.me/${phone.length === 10 ? '91'+phone : phone}?text=${encodeURIComponent(msg)}`;
                                    window.open(waUrl, '_blank');
                                  }}
                                  title="Send WhatsApp Message"
                                  className="text-green-500 hover:text-green-700 p-1 bg-green-50 rounded"
                                >
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if(window.confirm('Are you sure you want to delete this order?')) {
                                      remove(ref(db, `orders/${o.id}`)).then(() => {
                                        setOrdersList(prev => prev.filter(order => order.id !== o.id));
                                      });
                                    }
                                  }} 
                                  className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-6 max-w-5xl text-xs">
                  <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold font-sans">Products</h1>
                    <div className="flex space-x-2">
                      <button className="bg-white border border-[#CCCCCC] hover:border-black px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5">
                        <Download className="h-3.5 w-3.5" />
                        <span>Export</span>
                      </button>
                      {/* Hidden CSV file input */}
                      <input
                        type="file"
                        id="csv-import-input"
                        accept=".csv"
                        className="hidden"
                        onChange={handleCSVImport}
                      />
                      <button
                        onClick={() => document.getElementById('csv-import-input')?.click()}
                        disabled={csvImporting}
                        className="bg-white border border-[#CCCCCC] hover:border-[#008060] hover:text-[#008060] px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{csvImporting ? 'Importing...' : 'Import CSV'}</span>
                      </button>
                      <button 
                        onClick={() => setIsAddingProduct(true)}
                        className="bg-[#008060] text-white hover:bg-[#006e52] px-4 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add product</span>
                      </button>
                    </div>
                  </div>
                  {/* CSV import status message */}
                  {csvMessage && (
                    <div className={`text-xs px-4 py-2 rounded font-medium ${csvMessage.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {csvMessage}
                      <button onClick={() => setCsvMessage(null)} className="ml-3 text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 bg-white border border-[#D2D2D2] rounded-lg p-4 shadow-sm">
                    <div>
                      <span className="text-gray-500 block">Average sell-through rate</span>
                      <span className="font-bold text-sm block mt-1">0.07%</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Days of inventory remaining</span>
                      <span className="font-bold text-sm block mt-1">No data</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">ABC product analysis</span>
                      <span className="font-bold text-sm block mt-1 text-luxury-gold">₹0.00 A &bull; ₹0.00 C</span>
                    </div>
                  </div>

                  <div className="bg-white border border-[#D2D2D2] rounded-lg shadow-sm">
                    <div className="p-4 border-b border-[#EAEAEA] flex items-center justify-between">
                      <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search and filter..." 
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full bg-[#FAF9F6] border border-[#CCCCCC] focus:outline-none focus:border-luxury-gold rounded-md pl-8 pr-4 py-1.5 text-xs placeholder-gray-400"
                        />
                      </div>
                      {selectedProductIds.length > 0 && (
                        <button
                          onClick={handleBulkDeleteProducts}
                          className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete {selectedProductIds.length} items</span>
                        </button>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#FAF9F6] border-b border-[#EAEAEA] text-gray-500 uppercase tracking-wider text-[9px]">
                            <th className="p-4">
                              <input 
                                type="checkbox" 
                                checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProductIds(filteredProducts.map(p => p.id));
                                  } else {
                                    setSelectedProductIds([]);
                                  }
                                }}
                              />
                            </th>
                            <th className="p-4">Product</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Inventory</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Vendor</th>
                            <th className="p-4 text-right">Price</th>
                            <th className="p-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAEAEA]">
                          {filteredProducts.map(p => (
                            <tr key={p.id} className="hover:bg-[#FAF9F6]">
                              <td className="p-4">
                                <input 
                                  type="checkbox" 
                                  checked={selectedProductIds.includes(p.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedProductIds(prev => [...prev, p.id]);
                                    } else {
                                      setSelectedProductIds(prev => prev.filter(id => id !== p.id));
                                    }
                                  }}
                                />
                              </td>
                              <td className="p-4 font-semibold text-[#1a1a1a] max-w-xs truncate">{p.name}</td>
                              <td className="p-4">
                                <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
                                  p.status === 'Active' ? 'bg-[#E8F5E9] text-[#1B5E20]' : 'bg-[#ECEFF1] text-[#37474F]'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className={`p-4 text-center font-mono text-[10px] ${p.status === 'Active' && p.inventory <= 10 ? 'text-red-600 font-semibold' : ''}`}>
                                {p.inventory > 0 ? `${p.inventory} in stock` : 'Inventory not tracked'}
                              </td>
                              <td className="p-4 text-gray-500">{p.category}</td>
                              <td className="p-4">{p.type}</td>
                              <td className="p-4">{p.vendor}</td>
                              <td className="p-4 text-right font-serif font-medium">₹{p.price.toFixed(2)}</td>
                              <td className="p-4 text-center space-x-2">
                                <button onClick={() => handleEditProduct(p)} className="text-gray-500 hover:text-luxury-gold transition-colors font-medium">Edit</button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="text-gray-500 hover:text-red-500 transition-colors font-medium">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CUSTOMERS */}
              {activeTab === 'customers' && (
                <div className="space-y-6 max-w-5xl text-xs">
                  <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold font-sans">Customers</h1>
                    <div className="flex space-x-2">
                      <button className="bg-white border border-[#CCCCCC] hover:border-black px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5">
                        <Download className="h-3.5 w-3.5" />
                        <span>Export</span>
                      </button>
                      <button className="bg-white border border-[#CCCCCC] hover:border-black px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Import</span>
                      </button>
                      <button className="bg-black text-white hover:bg-gray-800 px-4 py-1.5 rounded-md text-xs font-medium">
                        Add customer
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white border border-[#D2D2D2] rounded-lg p-4 shadow-sm">
                    <div>
                      <span className="text-gray-500 block">Total Customers</span>
                      <span className="font-bold text-sm block mt-1">{customersList.length} customers</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Active User Segment</span>
                      <span className="font-bold text-sm block mt-1">100% of your customer base</span>
                    </div>
                  </div>

                  <div className="bg-white border border-[#D2D2D2] rounded-lg shadow-sm">
                    <div className="p-4 border-b border-[#EAEAEA] flex items-center justify-between">
                      <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search customers..." 
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full bg-[#FAF9F6] border border-[#CCCCCC] focus:outline-none focus:border-luxury-gold rounded-md pl-8 pr-4 py-1.5 text-xs placeholder-gray-400"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#FAF9F6] border-b border-[#EAEAEA] text-gray-500 uppercase tracking-wider text-[9px]">
                            <th className="p-4"><input type="checkbox" /></th>
                            <th className="p-4">Customer Name</th>
                            <th className="p-4">Email status</th>
                            <th className="p-4">Location</th>
                            <th className="p-4 font-mono">Orders</th>
                            <th className="p-4 text-right">Amount spent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAEAEA]">
                          {filteredCustomers.map((c, idx) => (
                            <tr key={idx} className="hover:bg-[#FAF9F6]">
                              <td className="p-4"><input type="checkbox" /></td>
                              <td className="p-4">
                                <span className="font-semibold text-gray-900 block">{c.name}</span>
                                <span className="text-[10px] text-gray-500">{c.email}</span>
                              </td>
                              <td className="p-4">
                                {c.subscribed ? (
                                  <span className="bg-[#E8F5E9] text-[#1B5E20] text-[9px] uppercase px-2 py-0.5 rounded font-bold">
                                    Subscribed
                                  </span>
                                ) : (
                                  <span className="bg-[#ECEFF1] text-[#37474F] text-[9px] uppercase px-2 py-0.5 rounded font-bold">
                                    Not subscribed
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-gray-600">{c.location}</td>
                              <td className="p-4 font-mono font-medium">{c.orders}</td>
                              <td className="p-4 text-right font-serif font-medium">₹{c.spent.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ANALYTICS (Live visitors tracker & services) */}
              {activeTab === 'analytics' && (
                <div className="space-y-6 max-w-5xl text-xs">
                  <div className="flex justify-between items-center border-b border-[#D2D2D2] pb-4">
                    <div>
                      <h1 className="text-xl font-bold font-sans">CMS Analytics Center</h1>
                      <p className="text-[10px] text-gray-400 uppercase mt-0.5 font-mono">Real-Time Core Metrics</p>
                    </div>
                    {/* Live indicator block */}
                    <div className="bg-white border border-[#CCCCCC] rounded px-4 py-1.5 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="font-mono font-bold text-gray-700">Live Traffic: {liveVisitors} Visitors</span>
                    </div>
                  </div>

                  {/* Core Services health status logs */}
                  <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
                    <h3 className="font-serif text-sm font-semibold text-[#1A1A1A] flex items-center space-x-1.5">
                      <Database className="h-4 w-4 text-luxury-gold" />
                      <span>CMS Essential Services Registry Status</span>
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Service 1 */}
                      <div className="border border-gray-100 p-3 rounded-md bg-[#FAF9F6] flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Database</span>
                          <span className="font-semibold text-gray-800">Neon Postgres</span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      {/* Service 2 */}
                      <div className="border border-gray-100 p-3 rounded-md bg-[#FAF9F6] flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Search Node</span>
                          <span className="font-semibold text-gray-800">Meilisearch</span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      {/* Service 3 */}
                      <div className="border border-gray-100 p-3 rounded-md bg-[#FAF9F6] flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 block">OTP SMS</span>
                          <span className="font-semibold text-gray-800">Twilio API</span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      {/* Service 4 */}
                      <div className="border border-gray-100 p-3 rounded-md bg-[#FAF9F6] flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase tracking-wider text-gray-400 block">Payments</span>
                          <span className="font-semibold text-gray-800">Stripe / Razorpay</span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* Grid Analytics Charts & visit Log */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    
                    {/* Live Visit Activity Logs (2 cols) */}
                    <div className="md:col-span-2 bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-[#EAEAEA] pb-2">
                        <h3 className="font-serif text-sm font-semibold text-[#1A1A1A]">Real-Time Visitor Activity Stream</h3>
                        <span className="text-[9px] text-gray-400 uppercase font-mono">Auto-refreshed</span>
                      </div>

                      <div className="divide-y divide-[#EAEAEA] text-xs font-sans">
                        {liveVisitsLog.map((log, idx) => (
                          <div key={idx} className="py-3 flex items-center justify-between hover:bg-[#FAF9F6] px-1 rounded transition-colors">
                            <div className="flex items-center space-x-3">
                              {log.device === 'Mobile' ? (
                                <Smartphone className="h-4.5 w-4.5 text-gray-400" />
                              ) : (
                                <Monitor className="h-4.5 w-4.5 text-gray-400" />
                              )}
                              <div>
                                <span className="font-semibold text-gray-900">{log.user}</span>
                                <span className="text-gray-400 ml-1 text-[10px]">({log.location})</span>
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  {log.action} <code className="bg-gray-100 px-1 py-0.2 rounded text-[9px] text-luxury-gold">{log.page}</code>
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-gray-400">{log.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Funnel & Conversion Rates (1 col) */}
                    <div className="space-y-6">
                      <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-[#EAEAEA] pb-2">
                          <span className="text-xs text-gray-500 font-semibold">Weekly Sales Trends</span>
                          <span className="text-[9px] text-green-600 font-bold">+129%</span>
                        </div>
                        <h3 className="font-serif text-lg font-bold">₹1,950.00 Total</h3>
                        {/* Mock Chart Area */}
                        <div className="h-32 bg-[#FAF9F6] border border-gray-100 rounded flex items-end p-2 space-x-3">
                          <div className="w-full bg-gray-200 h-8 rounded-t flex flex-col justify-end text-center text-[8px] text-gray-400"><span className="mb-0.5">W1</span></div>
                          <div className="w-full bg-gray-200 h-12 rounded-t flex flex-col justify-end text-center text-[8px] text-gray-400"><span className="mb-0.5">W2</span></div>
                          <div className="w-full bg-luxury-gold h-24 rounded-t flex flex-col justify-end text-center text-[8px] text-white"><span className="mb-0.5">W3</span></div>
                          <div className="w-full bg-gray-200 h-16 rounded-t flex flex-col justify-end text-center text-[8px] text-gray-400"><span className="mb-0.5">W4</span></div>
                        </div>
                      </div>

                      <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-[#EAEAEA] pb-2">
                          <span className="text-xs text-gray-500 font-semibold">Funnel Conversions</span>
                          <span className="text-[9px] text-luxury-gold font-bold">0.31% Rate</span>
                        </div>
                        <div className="space-y-2 text-[10px]">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Added to Cart</span>
                              <span>12 sessions (1.87%)</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#008060] h-full" style={{ width: '40%' }}></div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Purchased Checkout</span>
                              <span>2 sessions (0.31%)</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-luxury-gold h-full" style={{ width: '8%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* SPECIAL SCREEN: CUSTOMER REVIEWS MODERATION */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-300 pb-4 gap-4">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Feedback & Moderation</span>
                      <h1 className="text-xl font-bold font-sans text-[#1A1A1A]">Customer Reviews</h1>
                    </div>
                  </div>

                  {/* Summary Counters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-1">
                      <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Total Reviews</span>
                      <h3 className="font-serif text-2xl font-bold text-gray-900">{reviewsList.length}</h3>
                    </div>
                    <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-1">
                      <span className="text-[10px] text-[#D23F3F] font-semibold uppercase tracking-wider block">Pending Approval</span>
                      <h3 className="font-serif text-2xl font-bold text-[#D23F3F]">
                        {reviewsList.filter(r => r.status === 'pending').length}
                      </h3>
                    </div>
                    <div className="bg-white border border-[#D2D2D2] rounded-lg p-5 shadow-sm space-y-1">
                      <span className="text-[10px] text-[#008060] font-semibold uppercase tracking-wider block">Live Reviews</span>
                      <h3 className="font-serif text-2xl font-bold text-[#008060]">
                        {reviewsList.filter(r => r.status === 'approved').length}
                      </h3>
                    </div>
                  </div>

                  {/* Review Cards Lists Container */}
                  <div className="space-y-6 text-xs">
                    {/* Pending Moderation Queue */}
                    <div className="bg-white border border-[#D2D2D2] rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-red-50/50 px-5 py-4 border-b border-[#D2D2D2]">
                        <h2 className="text-xs font-bold font-sans text-red-900 uppercase tracking-wider">Pending Moderation Queue</h2>
                      </div>
                      
                      {reviewsList.filter(r => r.status === 'pending').length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-xs font-sans">
                          No reviews currently pending moderation. All reviews are up to date!
                        </div>
                      ) : (
                        <div className="divide-y divide-[#EAEAEA]">
                          {reviewsList.filter(r => r.status === 'pending').map((rev) => (
                            <div key={rev.id} className="p-5 flex flex-col md:flex-row gap-5 items-start justify-between">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900 text-sm">{rev.name}</span>
                                  <span className="text-[10px] text-gray-400 font-mono">{rev.date}</span>
                                </div>
                                {/* Stars */}
                                <div className="flex items-center space-x-1 text-yellow-500">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                                  ))}
                                  <span className="text-[10px] text-gray-500 ml-1">({rev.rating}/5)</span>
                                </div>
                                <p className="text-gray-700 text-xs leading-relaxed max-w-2xl">{rev.comment}</p>
                                
                                {/* Uploaded image file */}
                                {rev.image && (
                                  <div className="pt-2">
                                    <span className="text-[9px] text-gray-400 block mb-1">Attached Photo:</span>
                                    <div className="w-24 h-24 rounded border border-gray-200 overflow-hidden bg-gray-50 p-1 flex items-center justify-center">
                                      <img src={rev.image} alt="User attachment preview" className="max-h-full max-w-full object-contain" />
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex space-x-2 self-end md:self-center">
                                <button 
                                  onClick={() => handleApproveReview(rev.id)}
                                  className="bg-[#008060] hover:bg-[#006e52] text-white text-[10px] uppercase font-bold tracking-widest px-4 py-2 rounded transition-colors shadow-sm"
                                >
                                  Approve Live
                                </button>
                                <button 
                                  onClick={() => handleDeleteReview(rev.id)}
                                  className="bg-red-950/20 hover:bg-red-950/30 text-red-700 border border-red-200 text-[10px] uppercase font-bold tracking-widest px-4 py-2 rounded transition-colors"
                                >
                                  Reject & Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Approved & Live Feed */}
                    <div className="bg-white border border-[#D2D2D2] rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-[#FAF9F6] px-5 py-4 border-b border-[#D2D2D2]">
                        <h2 className="text-xs font-bold font-sans text-gray-800 uppercase tracking-wider">Live & Approved on Website</h2>
                      </div>
                      
                      {reviewsList.filter(r => r.status === 'approved').length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-xs font-sans">
                          No live reviews yet. Once you approve user reviews, they will display here and on the storefront.
                        </div>
                      ) : (
                        <div className="divide-y divide-[#EAEAEA]">
                          {reviewsList.filter(r => r.status === 'approved').map((rev) => (
                            <div key={rev.id} className="p-5 flex flex-col md:flex-row gap-5 items-start justify-between">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900 text-sm">{rev.name}</span>
                                  <span className="text-[10px] text-gray-400 font-mono">{rev.date}</span>
                                  <span className="bg-[#E8F5E9] text-[#1B5E20] text-[8px] uppercase px-1.5 py-0.5 rounded font-bold">Live</span>
                                </div>
                                {/* Stars */}
                                <div className="flex items-center space-x-1 text-yellow-500">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                                  ))}
                                  <span className="text-[10px] text-gray-500 ml-1">({rev.rating}/5)</span>
                                </div>
                                <p className="text-gray-700 text-xs leading-relaxed max-w-2xl">{rev.comment}</p>
                                
                                {rev.image && (
                                  <div className="pt-2">
                                    <div className="w-20 h-20 rounded border border-gray-200 overflow-hidden bg-gray-50 p-1 flex items-center justify-center">
                                      <img src={rev.image} alt="User attachment" className="max-h-full max-w-full object-contain" />
                                    </div>
                                  </div>
                                )}
                              </div>

                              <button 
                                onClick={() => handleDeleteReview(rev.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] uppercase font-bold tracking-widest px-4 py-2 rounded border border-red-200 transition-colors self-end md:self-center"
                              >
                                Delete Review
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'storage' && (
                <div className="space-y-6 text-left">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-300 pb-4 gap-4">
                    <div>
                      <h1 className="text-xl font-bold font-sans text-[#1A1A1A]">Media Storage</h1>
                      <p className="text-xs text-gray-500 mt-1">Upload and manage files here. Attach a Railway Volume to '/app/uploads' to make this persistent.</p>
                    </div>
                    <div className="relative">
                      <input 
                        type="file" 
                        id="storageUpload"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsStorageLoading(true);
                          const fd = new FormData();
                          fd.append('file', file);
                          try {
                            await fetch(`${API_URL}/cms/upload`, { method: 'POST', body: fd });
                            fetchStorageFiles();
                          } catch (err) {
                            console.error(err);
                          }
                          setIsStorageLoading(false);
                        }}
                      />
                      <label htmlFor="storageUpload" className="bg-[#008060] hover:bg-[#006e52] text-white px-4 py-2 rounded text-sm font-semibold cursor-pointer shadow flex items-center space-x-2">
                        <Upload className="w-4 h-4" />
                        <span>Upload File</span>
                      </label>
                    </div>
                  </div>

                  {isStorageLoading ? (
                    <div className="flex justify-center items-center py-20 text-gray-400">Loading files...</div>
                  ) : storageFiles.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500 shadow-sm">
                      <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-semibold text-gray-800">No files found</p>
                      <p className="text-sm mt-1">Upload images or videos to use across your store.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {storageFiles.map((f, i) => {
                        const isVideo = f.filename.match(/\.(mp4|webm|ogg)$/i);
                        return (
                          <div key={i} className="group relative bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden hover:border-gray-400 transition-colors">
                            <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                              {isVideo ? (
                                <video src={f.url} className="w-full h-full object-cover" muted loop onMouseEnter={(e)=>e.currentTarget.play()} onMouseLeave={(e)=>e.currentTarget.pause()} />
                              ) : (
                                <img src={f.url} className="w-full h-full object-cover" alt={f.filename} />
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                <button 
                                  onClick={() => { navigator.clipboard.writeText(f.url); alert('Copied URL to clipboard!'); }}
                                  className="p-2 bg-white rounded-full text-gray-800 hover:bg-gray-100" title="Copy URL"
                                >
                                  <Link2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={async () => {
                                    if(confirm('Delete file?')) {
                                      await fetch(`${API_URL}/cms/storage/${f.filename}`, { method: 'DELETE' });
                                      fetchStorageFiles();
                                    }
                                  }}
                                  className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600" title="Delete"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="p-2 text-[10px] bg-white border-t border-gray-100">
                              <p className="font-semibold truncate text-gray-800" title={f.filename}>{f.filename}</p>
                              <p className="text-gray-500 mt-0.5">{f.size > 1024 * 1024 ? (f.size / (1024 * 1024)).toFixed(1) + ' MB' : (f.size / 1024).toFixed(1) + ' KB'} • {new Date(f.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'filters' && (
                <ShopFiltersBuilder />
              )}
              {activeTab === 'store' && (
                <div className="space-y-6 text-left">
                  {/* Top Header & Page Selector Bar */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-300 pb-4 gap-4">
                    <div>
                      <span className="text-[10px] text-gray-500 block">CMS & Layout Builder</span>
                      <h1 className="text-xl font-bold font-sans text-[#1A1A1A]">Design & Pages</h1>
                      <p className="text-xs text-gray-500 mt-1">Manage templates, homepage, and create custom pages with dynamic sections.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                      <select 
                        value={currentPageId}
                        onChange={(e) => setCurrentPageId(e.target.value)}
                        className="border border-[#CCCCCC] rounded p-2 text-xs w-full lg:w-auto min-w-[200px]"
                      >
                        <optgroup label="System Templates">
                          <option value="home">Homepage (Root Layout)</option>
                          <option value="shop">Shop Page Template</option>
                          <option value="product_template">Product Page Template</option>
                        </optgroup>
                        <optgroup label="Custom Pages">
                          {pagesRegistry.map(page => (
                            <option key={page.id} value={page.id}>{page.title} (/pages/{page.slug})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Products EBC">
                          {productsList.map(product => (
                            <option key={product.id} value={`product-${product.slug}`}>{product.name} (/products/{product.slug})</option>
                          ))}
                        </optgroup>
                      </select>
                      
                      <button 
                        onClick={() => setShowCreatePageModal(true)}
                        className="bg-gray-100 hover:bg-gray-200 border border-gray-300 px-4 py-2 rounded text-xs font-semibold whitespace-nowrap text-gray-700"
                      >
                        Create Page
                      </button>

                      <div className="h-6 w-[1px] bg-gray-300 hidden sm:block" />

                      {/* Publish Button */}
                      <button
                        onClick={handlePublishLayout}
                        disabled={isPublishing || !hasUnpublishedChanges}
                        className={`px-5 py-2 rounded text-xs font-bold transition-all shadow-sm flex items-center space-x-2 ${
                          hasUnpublishedChanges 
                            ? 'bg-[#008060] hover:bg-[#006e52] text-white cursor-pointer' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        }`}
                      >
                        {isPublishing ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <span>Publish Changes</span>
                            {hasUnpublishedChanges && (
                              <span className="w-2 h-2 bg-red-400 rounded-full animate-ping block" />
                            )}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs gap-3">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${hasUnpublishedChanges ? 'bg-amber-500' : 'bg-green-500'}`} />
                      <span className="font-semibold text-gray-700">
                        {hasUnpublishedChanges 
                          ? 'You have unpublished changes. Click "Publish Changes" to show them on your live website.' 
                          : 'All draft changes are fully published to your live website.'}
                      </span>
                    </div>

                    {/* View & Device controls */}
                    <div className="flex items-center space-x-4">
                      {/* View Modes */}
                      <div className="flex bg-gray-200 p-1 rounded-md">
                        <button
                          onClick={() => setPreviewMode('edit')}
                          className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                            previewMode === 'edit' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Edit Only
                        </button>
                        <button
                          onClick={() => setPreviewMode('split')}
                          className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                            previewMode === 'split' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Split Screen
                        </button>
                        <button
                          onClick={() => setPreviewMode('preview')}
                          className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase transition-all ${
                            previewMode === 'preview' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Preview Only
                        </button>
                      </div>

                      {/* Device Toggles (if preview enabled) */}
                      {previewMode !== 'edit' && (
                        <div className="flex bg-gray-200 p-1 rounded-md">
                          <button
                            onClick={() => setPreviewDevice('desktop')}
                            title="Desktop View"
                            className={`p-1.5 rounded-sm transition-all ${
                              previewDevice === 'desktop' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <Monitor className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setPreviewDevice('mobile')}
                            title="Mobile View"
                            className={`p-1.5 rounded-sm transition-all ${
                              previewDevice === 'mobile' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <Smartphone className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Workspace Layout */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Controls (List / Edit Form) */}
                    <div className={`xl:col-span-5 space-y-4 ${
                      previewMode === 'preview' ? 'hidden' : 'block'
                    } ${
                      previewMode === 'edit' ? 'xl:col-span-12' : ''
                    }`}>
                      {editingSection ? (
                        <div className="bg-white border border-[#D2D2D2] rounded-lg p-6 shadow-sm space-y-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#EAEAEA] pb-4 gap-4">
                            <div className="flex items-center space-x-6">
                              <h2 className="text-lg font-bold font-sans capitalize">{editingSection.id.replace('_', ' ')}</h2>
                              <div className="flex bg-gray-100 p-1 rounded-md">
                                <button 
                                  onClick={() => setEditModalTab('content')} 
                                  className={`px-3 py-1 text-xs rounded-sm transition-all ${editModalTab === 'content' ? 'bg-white shadow font-bold text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                  Content
                                </button>
                                <button 
                                  onClick={() => setEditModalTab('design')} 
                                  className={`px-3 py-1 text-xs rounded-sm transition-all ${editModalTab === 'design' ? 'bg-white shadow font-bold text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                  Design Settings
                                </button>
                              </div>
                            </div>
                            <button 
                              onClick={() => setEditingSection(null)}
                              className="text-gray-500 hover:text-black font-semibold text-xs"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="space-y-6">
                            {editModalTab === 'content' ? (
                              <>
                            
                            {/* Direct Edit Fields */}
                            <div className="space-y-4">
                              <h3 className="text-sm font-semibold border-b pb-2">Direct Edit</h3>
                              
                              {/* Special logic for Hero Banner Slides */}
                              {editingSection.id.startsWith('hero_banner') && Array.isArray(editingSection.data?.slides) && (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold text-gray-700">Slider Interval (seconds)</label>
                                    <input 
                                      type="number" 
                                      min="1" 
                                      value={editingSection.data.sliderInterval || 5}
                                      onChange={(e) => {
                                        setEditingSection({
                                          ...editingSection,
                                          data: { ...editingSection.data, sliderInterval: parseInt(e.target.value) }
                                        });
                                      }}
                                      className="border border-gray-300 rounded p-1 text-xs w-20"
                                    />
                                  </div>
                                  
                                  {editingSection.data.slides.map((slide: any, slideIdx: number) => (
                                    <div key={slide.id || slideIdx} className="border border-gray-200 p-4 rounded-md bg-gray-50 space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <h4 className="font-bold text-sm">Slide {slideIdx + 1}</h4>
                                        <button 
                                          onClick={() => {
                                            const newSlides = [...editingSection.data.slides];
                                            newSlides.splice(slideIdx, 1);
                                            setEditingSection({
                                              ...editingSection,
                                              data: { ...editingSection.data, slides: newSlides }
                                            });
                                          }}
                                          className="text-red-500 text-xs font-bold hover:underline"
                                        >
                                          Remove Slide
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Desktop Media URL</label>
                                          <input 
                                            type="text" 
                                            placeholder="Paste desktop video/image link"
                                            value={slide.mediaUrl && slide.mediaUrl.startsWith('http') ? slide.mediaUrl : ''}
                                            onChange={(e) => {
                                              const newSlides = [...editingSection.data.slides];
                                              newSlides[slideIdx].mediaUrl = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                          />
                                          <label className="block text-xs font-semibold mb-1 mt-3">Mobile Image URL</label>
                                          <input 
                                            type="text" 
                                            placeholder="Paste mobile image link"
                                            value={slide.mobileMediaUrl && slide.mobileMediaUrl.startsWith('http') ? slide.mobileMediaUrl : ''}
                                            onChange={(e) => {
                                              const newSlides = [...editingSection.data.slides];
                                              newSlides[slideIdx].mobileMediaUrl = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Upload Media (Temporary)</label>
                                          <input 
                                            type="file" 
                                            accept="image/*,video/*"
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                try {
                                                  const uploadRes = await fetch(`${API_URL}/cms/upload`, {
                                                    method: 'POST',
                                                    body: formData,
                                                  });
                                                  if (!uploadRes.ok) throw new Error('Upload failed');
                                                  const uploadData = await uploadRes.json();
                                                  
                                                  const newSlides = [...editingSection.data.slides];
                                                  newSlides[slideIdx].mediaUrl = uploadData.url;
                                                  newSlides[slideIdx].mediaType = file.type.startsWith('video') ? 'video' : 'image';
                                                  setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                                } catch (err) {
                                                  console.error('File upload error:', err);
                                                  // Fallback to local Base64
                                                  const reader = new FileReader();
                                                  reader.onloadend = () => {
                                                    const newSlides = [...editingSection.data.slides];
                                                    newSlides[slideIdx].mediaUrl = reader.result;
                                                    newSlides[slideIdx].mediaType = file.type.startsWith('video') ? 'video' : 'image';
                                                    setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }
                                            }}
                                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                                          />
                                          {slide.mediaUrl && (
                                            <div className="mt-2 h-16 w-full rounded overflow-hidden bg-gray-200 flex items-center justify-center">
                                              {slide.mediaType === 'video' ? (
                                                <video src={slide.mediaUrl} className="w-full h-full object-cover" muted />
                                              ) : (
                                                <img src={slide.mediaUrl} className="w-full h-full object-cover" />
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Upload Mobile Media (Temporary)</label>
                                          <input 
                                            type="file" 
                                            accept="image/*,video/*"
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                try {
                                                  const uploadRes = await fetch(`${API_URL}/cms/upload`, {
                                                    method: 'POST',
                                                    body: formData,
                                                  });
                                                  if (!uploadRes.ok) throw new Error('Upload failed');
                                                  const uploadData = await uploadRes.json();
                                                  
                                                  const newSlides = [...editingSection.data.slides];
                                                  newSlides[slideIdx].mobileMediaUrl = uploadData.url;
                                                  setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                                } catch (err) {
                                                  console.error('File upload error:', err);
                                                  const reader = new FileReader();
                                                  reader.onloadend = () => {
                                                    const newSlides = [...editingSection.data.slides];
                                                    newSlides[slideIdx].mobileMediaUrl = reader.result;
                                                    setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }
                                            }}
                                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                                          />
                                          {slide.mobileMediaUrl && (
                                            <div className="mt-2 h-16 w-full rounded overflow-hidden bg-gray-200 flex items-center justify-center">
                                              {slide.mediaType === 'video' ? (
                                                <video src={slide.mobileMediaUrl} className="w-full h-full object-cover" muted />
                                              ) : (
                                                <img src={slide.mobileMediaUrl} className="w-full h-full object-cover" />
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Media Type</label>
                                          <select 
                                            value={slide.mediaType || 'image'}
                                            onChange={(e) => {
                                              const newSlides = [...editingSection.data.slides];
                                              newSlides[slideIdx].mediaType = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                          >
                                            <option value="image">Image</option>
                                            <option value="video">Video</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Image Fit style</label>
                                          <select 
                                            value={slide.imageFit || 'cover'}
                                            onChange={(e) => {
                                              const newSlides = [...editingSection.data.slides];
                                              newSlides[slideIdx].imageFit = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                            disabled={slide.mediaType === 'video'}
                                          >
                                            <option value="cover">Crop Fit (Default)</option>
                                            <option value="contain">Full Fit (Fit to frame)</option>
                                            <option value="fill">Stretch Fit</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Title</label>
                                          <input 
                                            type="text" 
                                            value={slide.title || ''} 
                                            onChange={(e) => {
                                              const newSlides = [...editingSection.data.slides];
                                              newSlides[slideIdx].title = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Subtitle</label>
                                          <input 
                                            type="text" 
                                            value={slide.subtitle || ''} 
                                            onChange={(e) => {
                                              const newSlides = [...editingSection.data.slides];
                                              newSlides[slideIdx].subtitle = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, slides: newSlides}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  <button 
                                    onClick={() => {
                                      setEditingSection({
                                        ...editingSection,
                                        data: {
                                          ...editingSection.data,
                                          slides: [...editingSection.data.slides, { id: `slide-${Date.now()}`, mediaType: 'image', mediaUrl: '', title: 'New Slide' }]
                                        }
                                      });
                                    }}
                                    className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 border-dashed text-gray-700 py-2 rounded text-xs font-bold"
                                  >
                                    + Add Another Slide
                                  </button>
                                </div>
                              )}
                              {/* Special logic for Text Paragraph Blocks */}
                              {editingSection.id.startsWith('text_paragraph') && Array.isArray(editingSection.data?.blocks) && (
                                <div className="space-y-4">
                                  {editingSection.data.blocks.map((block: any, idx: number) => (
                                    <div key={idx} className="border border-gray-200 p-4 rounded-md bg-gray-50 space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <h4 className="font-bold text-sm">Text Block {idx + 1}</h4>
                                        <button 
                                          onClick={() => {
                                            const newBlocks = editingSection.data.blocks.filter((_: any, i: number) => i !== idx);
                                            setEditingSection({
                                              ...editingSection,
                                              data: { ...editingSection.data, blocks: newBlocks }
                                            });
                                          }}
                                          className="text-red-500 text-xs font-bold hover:underline"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-semibold mb-1">Sub Heading (Optional)</label>
                                        <input 
                                          type="text" 
                                          value={block.heading || ''} 
                                          onChange={(e) => {
                                            const newBlocks = [...editingSection.data.blocks];
                                            newBlocks[idx].heading = e.target.value;
                                            setEditingSection({...editingSection, data: {...editingSection.data, blocks: newBlocks}});
                                          }}
                                          placeholder="Enter sub-heading"
                                          className="w-full border border-gray-300 rounded p-2 text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-semibold mb-1">Paragraph Text</label>
                                        <textarea 
                                          rows={5}
                                          value={block.paragraph || ''} 
                                          onChange={(e) => {
                                            const newBlocks = [...editingSection.data.blocks];
                                            newBlocks[idx].paragraph = e.target.value;
                                            setEditingSection({...editingSection, data: {...editingSection.data, blocks: newBlocks}});
                                          }}
                                          placeholder="Enter paragraph text"
                                          className="w-full border border-gray-300 rounded p-2 text-xs"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                  
                                  <button 
                                    onClick={() => {
                                      setEditingSection({
                                        ...editingSection,
                                        data: {
                                          ...editingSection.data,
                                          blocks: [...editingSection.data.blocks, { heading: 'New Heading', paragraph: 'New text content...' }]
                                        }
                                      });
                                    }}
                                    className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 border-dashed text-gray-700 py-2 rounded text-xs font-bold"
                                  >
                                    + Add Another Text Block
                                  </button>
                                </div>
                              )}
                              {/* Special logic for Shop by Concern */}
                              {editingSection.id.startsWith('shop_by_concern') && Array.isArray(editingSection.data?.items) && (
                                <div className="space-y-4">
                                  {editingSection.data.items.map((item: any, itemIdx: number) => (
                                    <div key={itemIdx} className="border border-gray-200 p-4 rounded-md bg-gray-50 space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <h4 className="font-bold text-sm">Block {itemIdx + 1}</h4>
                                        <button 
                                          onClick={() => {
                                            const newItems = [...editingSection.data.items];
                                            newItems.splice(itemIdx, 1);
                                            setEditingSection({
                                              ...editingSection,
                                              data: { ...editingSection.data, items: newItems }
                                            });
                                          }}
                                          className="text-red-500 text-xs font-bold hover:underline"
                                        >
                                          Remove Block
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">External Image URL</label>
                                          <input 
                                            type="text" 
                                            placeholder="Paste image link here"
                                            value={item.img && item.img.startsWith('http') ? item.img : ''}
                                            onChange={(e) => {
                                              const newItems = [...editingSection.data.items];
                                              newItems[itemIdx].img = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, items: newItems}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs mb-2"
                                          />
                                          <label className="block text-xs font-semibold mb-1">Upload Image (Temporary)</label>
                                          <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                  const newItems = [...editingSection.data.items];
                                                  newItems[itemIdx].img = reader.result;
                                                  setEditingSection({...editingSection, data: {...editingSection.data, items: newItems}});
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                                          />
                                          {item.img && (
                                            <div className="mt-2 h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-300">
                                              <img src={item.img} className="w-full h-full object-cover" />
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Title</label>
                                          <input 
                                            type="text" 
                                            value={item.name || ''} 
                                            onChange={(e) => {
                                              const newItems = [...editingSection.data.items];
                                              newItems[itemIdx].name = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, items: newItems}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                          />
                                        </div>
                                        <div className="col-span-2">
                                          <label className="block text-xs font-semibold mb-1">Page Link</label>
                                          <input 
                                            type="text" 
                                            value={item.link || ''} 
                                            placeholder="/shop?category=something"
                                            onChange={(e) => {
                                              const newItems = [...editingSection.data.items];
                                              newItems[itemIdx].link = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, items: newItems}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  <button 
                                    onClick={() => {
                                      setEditingSection({
                                        ...editingSection,
                                        data: {
                                          ...editingSection.data,
                                          items: [...editingSection.data.items, { name: 'New Block', img: '', link: '/shop' }]
                                        }
                                      });
                                    }}
                                    className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 border-dashed text-gray-700 py-2 rounded text-xs font-bold"
                                  >
                                    + Add Another Block
                                  </button>
                                </div>
                              )}

                              {/* Special logic for Slow Beauty (Rituals are never rushed) */}
                              {editingSection.id.startsWith('slow_beauty') && (
                                <div className="space-y-4 border border-gray-200 p-4 rounded-md bg-gray-50 mt-4">
                                  <h4 className="font-bold text-sm border-b border-gray-200 pb-2">Media Settings</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Media Type</label>
                                      <select 
                                        value={editingSection.data.mediaType || 'image'}
                                        onChange={(e) => {
                                          setEditingSection({...editingSection, data: {...editingSection.data, mediaType: e.target.value}});
                                        }}
                                        className="w-full border border-gray-300 rounded p-2 text-xs"
                                      >
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Image Fit</label>
                                      <select value={editingSection.data.fitMode || 'cover'} onChange={(e) => { setEditingSection({...editingSection, data: {...editingSection.data, fitMode: e.target.value}}); }} className="w-full border border-gray-300 rounded p-2 text-xs">
                                        <option value="cover">Crop to Fit</option>
                                        <option value="stretch">Stretch to Fit</option>
                                        <option value="contain">Full to Fit</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">External Media URL</label>
                                      <input 
                                        type="text" 
                                        placeholder="Paste video/image link here"
                                        value={editingSection.data.videoImage && editingSection.data.videoImage.startsWith('http') ? editingSection.data.videoImage : ''}
                                        onChange={(e) => setEditingSection({...editingSection, data: {...editingSection.data, videoImage: e.target.value}})}
                                        className="w-full border border-gray-300 rounded p-2 text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Upload Media (Temporary)</label>
                                      <input 
                                        type="file" 
                                        accept="image/*,video/*"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                              const uploadRes = await fetch(`${API_URL}/cms/upload`, {
                                                method: 'POST',
                                                body: formData,
                                              });
                                              if (!uploadRes.ok) throw new Error('Upload failed');
                                              const uploadData = await uploadRes.json();
                                              
                                              setEditingSection({...editingSection, data: {...editingSection.data, videoImage: uploadData.url, mediaType: file.type.startsWith('video') ? 'video' : 'image'}});
                                            } catch (err) {
                                              console.error('File upload error:', err);
                                              // Fallback to local Base64
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                setEditingSection({...editingSection, data: {...editingSection.data, videoImage: reader.result, mediaType: file.type.startsWith('video') ? 'video' : 'image'}});
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }
                                        }}
                                        className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                                      />
                                    </div>
                                  </div>
                                  {editingSection.data.videoImage && (
                                    <div className="mt-2 h-32 w-full rounded overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-300">
                                      {editingSection.data.mediaType === 'video' || (editingSection.data.videoImage && editingSection.data.videoImage.includes('.mp4')) ? (
                                        <video src={editingSection.data.videoImage} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                                      ) : (
                                        <img src={editingSection.data.videoImage} className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Special logic for Our Story */}
                              {editingSection.id.startsWith('our_story') && (
                                <div className="space-y-4 border border-gray-200 p-4 rounded-md bg-gray-50 mt-4">
                                  <h4 className="font-bold text-sm border-b border-gray-200 pb-2">Media Settings</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Media Type</label>
                                      <select 
                                        value={editingSection.data.mediaType || 'image'}
                                        onChange={(e) => {
                                          setEditingSection({...editingSection, data: {...editingSection.data, mediaType: e.target.value}});
                                        }}
                                        className="w-full border border-gray-300 rounded p-2 text-xs"
                                      >
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Image Fit</label>
                                      <select value={editingSection.data.fitMode || 'cover'} onChange={(e) => { setEditingSection({...editingSection, data: {...editingSection.data, fitMode: e.target.value}}); }} className="w-full border border-gray-300 rounded p-2 text-xs">
                                        <option value="cover">Crop to Fit</option>
                                        <option value="stretch">Stretch to Fit</option>
                                        <option value="contain">Full to Fit</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">External Media URL</label>
                                      <input 
                                        type="text" 
                                        placeholder="Paste video/image link here"
                                        value={editingSection.data.image && editingSection.data.image.startsWith('http') ? editingSection.data.image : ''}
                                        onChange={(e) => setEditingSection({...editingSection, data: {...editingSection.data, image: e.target.value}})}
                                        className="w-full border border-gray-300 rounded p-2 text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Upload Media (Temporary)</label>
                                      <input 
                                        type="file" 
                                        accept="image/*,video/*"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                              const uploadRes = await fetch(`${API_URL}/cms/upload`, {
                                                method: 'POST',
                                                body: formData,
                                              });
                                              if (!uploadRes.ok) throw new Error('Upload failed');
                                              const uploadData = await uploadRes.json();
                                              
                                              setEditingSection({...editingSection, data: {...editingSection.data, image: uploadData.url, mediaType: file.type.startsWith('video') ? 'video' : 'image'}});
                                            } catch (err) {
                                              console.error('File upload error:', err);
                                              // Fallback to local Base64
                                              const reader = new FileReader();
                                              reader.onloadend = () => {
                                                setEditingSection({...editingSection, data: {...editingSection.data, image: reader.result, mediaType: file.type.startsWith('video') ? 'video' : 'image'}});
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }
                                        }}
                                        className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                                      />
                                    </div>
                                  </div>
                                  {editingSection.data.image && (
                                    <div className="mt-2 h-32 w-full rounded overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-300">
                                      {editingSection.data.mediaType === 'video' ? (
                                        <video src={editingSection.data.image} className="w-full h-full object-cover" muted />
                                      ) : (
                                        <img src={editingSection.data.image} className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Special logic for Trusted Tales */}
                              {editingSection.id.startsWith('trusted_tales') && Array.isArray(editingSection.data?.items) && (
                                <div className="space-y-4 mt-4">
                                  {editingSection.data.items.map((item: any, itemIdx: number) => (
                                    <div key={itemIdx} className="border border-gray-200 p-4 rounded-md bg-gray-50 space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <h4 className="font-bold text-sm">Tale {itemIdx + 1}</h4>
                                        <button 
                                          onClick={() => {
                                            const newItems = [...editingSection.data.items];
                                            newItems.splice(itemIdx, 1);
                                            setEditingSection({
                                              ...editingSection,
                                              data: { ...editingSection.data, items: newItems }
                                            });
                                          }}
                                          className="text-red-500 text-xs font-bold hover:underline"
                                        >
                                          Remove Tale
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Media Type</label>
                                          <select 
                                            value={item.mediaType || 'image'}
                                            onChange={(e) => {
                                              const newItems = [...editingSection.data.items];
                                              newItems[itemIdx].mediaType = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, items: newItems}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                          >
                                            <option value="image">Image</option>
                                            <option value="video">Video</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Image Fit</label>
                                          <select value={item.fitMode || 'cover'} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].fitMode=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs">
                                            <option value="cover">Crop to Fit</option>
                                            <option value="stretch">Stretch to Fit</option>
                                            <option value="contain">Full to Fit</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Upload Media</label>
                                          <input 
                                            type="file" 
                                            accept="image/*,video/*"
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                try {
                                                  const uploadRes = await fetch(`${API_URL}/cms/upload`, {
                                                    method: 'POST',
                                                    body: formData,
                                                  });
                                                  if (!uploadRes.ok) throw new Error('Upload failed');
                                                  const uploadData = await uploadRes.json();
                                                  
                                                  const newItems = [...editingSection.data.items];
                                                  newItems[itemIdx].img = uploadData.url;
                                                  newItems[itemIdx].mediaType = file.type.startsWith('video') ? 'video' : 'image';
                                                  setEditingSection({...editingSection, data: {...editingSection.data, items: newItems}});
                                                } catch (err) {
                                                  console.error('File upload error:', err);
                                                  const reader = new FileReader();
                                                  reader.onloadend = () => {
                                                    const newItems = [...editingSection.data.items];
                                                    newItems[itemIdx].img = reader.result;
                                                    newItems[itemIdx].mediaType = file.type.startsWith('video') ? 'video' : 'image';
                                                    setEditingSection({...editingSection, data: {...editingSection.data, items: newItems}});
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }
                                            }}
                                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                                          />
                                        </div>
                                        {item.img && (
                                          <div className="col-span-2 h-32 w-full rounded overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-300">
                                            {item.mediaType === 'video' ? (
                                              <video src={item.img} className="w-full h-full object-cover" muted />
                                            ) : (
                                              <img src={item.img} className="w-full h-full object-cover" />
                                            )}
                                          </div>
                                        )}
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Title</label>
                                          <input 
                                            type="text" 
                                            value={item.title || ''} 
                                            onChange={(e) => {
                                              const newItems = [...editingSection.data.items];
                                              newItems[itemIdx].title = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, items: newItems}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Description</label>
                                          <input 
                                            type="text" 
                                            value={item.desc || ''} 
                                            onChange={(e) => {
                                              const newItems = [...editingSection.data.items];
                                              newItems[itemIdx].desc = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, items: newItems}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Price</label>
                                          <input 
                                            type="text" 
                                            value={item.price || ''} 
                                            onChange={(e) => {
                                              const newItems = [...editingSection.data.items];
                                              newItems[itemIdx].price = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, items: newItems}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Likes</label>
                                          <input 
                                            type="number" 
                                            value={item.likes || 0} 
                                            onChange={(e) => {
                                              const newItems = [...editingSection.data.items];
                                              newItems[itemIdx].likes = parseInt(e.target.value);
                                              setEditingSection({...editingSection, data: {...editingSection.data, items: newItems}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                          />
                                        </div>
                                        <div className="col-span-2">
                                          <label className="block text-xs font-semibold mb-1">Shop Link</label>
                                          <input 
                                            type="text" 
                                            value={item.shopLink || ''} 
                                            placeholder="/shop?category=..."
                                            onChange={(e) => {
                                              const newItems = [...editingSection.data.items];
                                              newItems[itemIdx].shopLink = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, items: newItems}});
                                            }}
                                            className="w-full border border-gray-300 rounded p-2 text-xs"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  <button 
                                    onClick={() => {
                                      setEditingSection({
                                        ...editingSection,
                                        data: {
                                          ...editingSection.data,
                                          items: [...editingSection.data.items, { title: 'New Tale', desc: 'Description', price: '₹0', img: '', shopLink: '/shop', likes: 0, mediaType: 'image' }]
                                        }
                                      });
                                    }}
                                    className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 border-dashed text-gray-700 py-2 rounded text-xs font-bold"
                                  >
                                    + Add Another Tale
                                  </button>
                                </div>
                              )}

                              {/* Special editor: Latest Reads */}
                              {editingSection.id.startsWith('latest_reads') && Array.isArray(editingSection.data?.items) && (
                                <div className="space-y-4 mt-4">
                                  {editingSection.data.items.map((item: any, itemIdx: number) => (
                                    <div key={itemIdx} className="border border-gray-200 p-4 rounded-md bg-gray-50 space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <h4 className="font-bold text-sm">Article {itemIdx + 1}</h4>
                                        <button onClick={() => { const ni = [...editingSection.data.items]; ni.splice(itemIdx, 1); setEditingSection({...editingSection, data: {...editingSection.data, items: ni}}); }} className="text-red-500 text-xs font-bold hover:underline">Remove</button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Media Type</label>
                                          <select value={item.mediaType || 'image'} onChange={(e) => { const ni = [...editingSection.data.items]; ni[itemIdx].mediaType = e.target.value; setEditingSection({...editingSection, data: {...editingSection.data, items: ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs">
                                            <option value="image">Image</option>
                                            <option value="video">Video</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Image Fit</label>
                                          <select value={item.fitMode || 'cover'} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].fitMode=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs">
                                            <option value="cover">Crop to Fit</option>
                                            <option value="stretch">Stretch to Fit</option>
                                            <option value="contain">Full to Fit</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Upload Media</label>
                                          <input type="file" accept="image/*,video/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const fd = new FormData(); fd.append('file', file); try { const r = await fetch(`${API_URL}/cms/upload`, {method:'POST', body:fd}); const d = await r.json(); const ni = [...editingSection.data.items]; ni[itemIdx].image = d.url; ni[itemIdx].mediaType = file.type.startsWith('video') ? 'video' : 'image'; setEditingSection({...editingSection, data:{...editingSection.data, items:ni}}); } catch { const reader = new FileReader(); reader.onloadend = () => { const ni = [...editingSection.data.items]; ni[itemIdx].image = reader.result; ni[itemIdx].mediaType = file.type.startsWith('video') ? 'video' : 'image'; setEditingSection({...editingSection, data:{...editingSection.data, items:ni}}); }; reader.readAsDataURL(file); }}} className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100" />
                                        </div>
                                        {item.image && <div className="col-span-2 h-24 rounded overflow-hidden border border-gray-300">{item.mediaType === 'video' ? <video src={item.image} className="w-full h-full object-cover" muted /> : <img src={item.image} className="w-full h-full object-cover" />}</div>}
                                        <div><label className="block text-xs font-semibold mb-1">Title</label><input type="text" value={item.title||''} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].title=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" /></div>
                                        <div><label className="block text-xs font-semibold mb-1">Category</label><input type="text" value={item.category||''} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].category=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" /></div>
                                        <div><label className="block text-xs font-semibold mb-1">Date</label><input type="text" value={item.date||''} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].date=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" /></div>
                                        <div><label className="block text-xs font-semibold mb-1">Page Link (Optional)</label><input type="text" value={item.link||''} placeholder="/blogs/my-article" onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].link=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" /></div>
                                        <div className="col-span-2"><label className="block text-xs font-semibold mb-1">Content</label><textarea rows={3} value={item.content||''} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].content=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" /></div>
                                      </div>
                                    </div>
                                  ))}
                                  <button onClick={() => setEditingSection({...editingSection, data:{...editingSection.data, items:[...editingSection.data.items, {title:'New Article', category:'Category', date:'July 2026', image:'', content:'', link:'', mediaType:'image'}]}})} className="w-full bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-300 text-gray-700 py-2 rounded text-xs font-bold">+ Add Article</button>
                                </div>
                              )}

                              {/* Special editor: Testimonials Slider */}
                              {editingSection.id.startsWith('testimonials_slider') && Array.isArray(editingSection.data?.items) && (
                                <div className="space-y-4 mt-4">
                                  {editingSection.data.items.map((item: any, itemIdx: number) => (
                                    <div key={itemIdx} className="border border-gray-200 p-4 rounded-md bg-gray-50 space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <h4 className="font-bold text-sm">Review {itemIdx + 1}</h4>
                                        <button onClick={() => { const ni = [...editingSection.data.items]; ni.splice(itemIdx, 1); setEditingSection({...editingSection, data: {...editingSection.data, items: ni}}); }} className="text-red-500 text-xs font-bold hover:underline">Remove</button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Media Type</label>
                                          <select value={item.mediaType || 'image'} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].mediaType=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs">
                                            <option value="image">Image</option>
                                            <option value="video">Video</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Image Fit</label>
                                          <select value={item.fitMode || 'cover'} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].fitMode=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs">
                                            <option value="cover">Crop to Fit</option>
                                            <option value="stretch">Stretch to Fit</option>
                                            <option value="contain">Full to Fit</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Upload Media</label>
                                          <input type="file" accept="image/*,video/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const fd = new FormData(); fd.append('file', file); try { const r = await fetch(`${API_URL}/cms/upload`, {method:'POST', body:fd}); const d = await r.json(); const ni=[...editingSection.data.items]; ni[itemIdx].image=d.url; ni[itemIdx].mediaType=file.type.startsWith('video')?'video':'image'; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); } catch { const reader=new FileReader(); reader.onloadend=()=>{ const ni=[...editingSection.data.items]; ni[itemIdx].image=reader.result; ni[itemIdx].mediaType=file.type.startsWith('video')?'video':'image'; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }; reader.readAsDataURL(file); }}} className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100" />
                                        </div>
                                        {item.image && <div className="col-span-2 h-24 rounded overflow-hidden border border-gray-300">{item.mediaType === 'video' ? <video src={item.image} className="w-full h-full object-cover" muted /> : <img src={item.image} className="w-full h-full object-cover" />}</div>}
                                        <div><label className="block text-xs font-semibold mb-1">Name</label><input type="text" value={item.name||''} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].name=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" /></div>
                                        <div><label className="block text-xs font-semibold mb-1">Time Ago</label><input type="text" value={item.timeAgo||''} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].timeAgo=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" /></div>
                                        <div><label className="block text-xs font-semibold mb-1">Rating (1-5)</label><input type="number" min="1" max="5" value={item.rating||5} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].rating=parseInt(e.target.value); setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" /></div>
                                        <div><label className="block text-xs font-semibold mb-1">Page Link (Optional)</label><input type="text" value={item.link||''} placeholder="/products/my-product" onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].link=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" /></div>
                                        <div className="col-span-2"><label className="block text-xs font-semibold mb-1">Review Text</label><textarea rows={3} value={item.text||''} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].text=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" /></div>
                                      </div>
                                    </div>
                                  ))}
                                  <button onClick={() => setEditingSection({...editingSection, data:{...editingSection.data, items:[...editingSection.data.items, {name:'New Reviewer', text:'Review text...', rating:5, timeAgo:'Recently', image:'', link:'', mediaType:'image'}]}})} className="w-full bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-300 text-gray-700 py-2 rounded text-xs font-bold">+ Add Review</button>
                                </div>
                              )}

                              {/* Special editor: Brand USPs */}
                              {editingSection.id.startsWith('brand_usps') && Array.isArray(editingSection.data?.items) && (
                                <div className="space-y-4 mt-4">
                                  {editingSection.data.items.map((item: any, itemIdx: number) => (
                                    <div key={itemIdx} className="border border-gray-200 p-4 rounded-md bg-gray-50 space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <h4 className="font-bold text-sm">Feature {itemIdx + 1}</h4>
                                        <button onClick={() => { const ni = [...editingSection.data.items]; ni.splice(itemIdx, 1); setEditingSection({...editingSection, data: {...editingSection.data, items: ni}}); }} className="text-red-500 text-xs font-bold hover:underline">Remove</button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Media Type</label>
                                          <select value={item.mediaType || 'image'} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].mediaType=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs">
                                            <option value="image">Image</option>
                                            <option value="video">Video</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Image Fit</label>
                                          <select value={item.fitMode || 'cover'} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].fitMode=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs">
                                            <option value="cover">Crop to Fit</option>
                                            <option value="stretch">Stretch to Fit</option>
                                            <option value="contain">Full to Fit</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Upload Media</label>
                                          <input type="file" accept="image/*,video/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const fd = new FormData(); fd.append('file', file); try { const r = await fetch(`${API_URL}/cms/upload`, {method:'POST', body:fd}); const d = await r.json(); const ni=[...editingSection.data.items]; ni[itemIdx].img=d.url; ni[itemIdx].mediaType=file.type.startsWith('video')?'video':'image'; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); } catch { const reader=new FileReader(); reader.onloadend=()=>{ const ni=[...editingSection.data.items]; ni[itemIdx].img=reader.result; ni[itemIdx].mediaType=file.type.startsWith('video')?'video':'image'; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }; reader.readAsDataURL(file); }}} className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100" />
                                        </div>
                                        {item.img && <div className="col-span-2 h-24 rounded overflow-hidden border border-gray-300">{item.mediaType === 'video' ? <video src={item.img} className="w-full h-full object-cover" muted /> : <img src={item.img} className="w-full h-full object-cover" />}</div>}
                                        <div><label className="block text-xs font-semibold mb-1">Title</label><input type="text" value={item.title||''} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].title=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" /></div>
                                        <div><label className="block text-xs font-semibold mb-1">Page Link (Optional)</label><input type="text" value={item.link||''} placeholder="/pages/ayurveda" onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].link=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" /></div>
                                        <div className="col-span-2"><label className="block text-xs font-semibold mb-1">Description</label><textarea rows={3} value={item.desc||''} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].desc=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" /></div>
                                      </div>
                                    </div>
                                  ))}
                                  <button onClick={() => setEditingSection({...editingSection, data:{...editingSection.data, items:[...editingSection.data.items, {title:'New Feature', desc:'Description...', img:'', link:'', mediaType:'image'}]}})} className="w-full bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-300 text-gray-700 py-2 rounded text-xs font-bold">+ Add Feature</button>
                                </div>
                              )}
                              {/* Special editor: Instagram Integration */}
                              {editingSection.id.startsWith('instagram_integration') && Array.isArray(editingSection.data?.items) && (
                                <div className="space-y-4 mt-4">
                                  {editingSection.data.items.map((item: any, itemIdx: number) => (
                                    <div key={itemIdx} className="border border-gray-200 p-4 rounded-md bg-gray-50 space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <h4 className="font-bold text-sm">Block {itemIdx + 1}</h4>
                                        <button onClick={() => { const ni = [...editingSection.data.items]; ni.splice(itemIdx, 1); setEditingSection({...editingSection, data: {...editingSection.data, items: ni}}); }} className="text-red-500 text-xs font-bold hover:underline">Remove</button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Image Thumbnail Fit</label>
                                          <select value={item.fitMode || 'cover'} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].fitMode=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs">
                                            <option value="cover">Crop to Fit</option>
                                            <option value="stretch">Stretch to Fit</option>
                                            <option value="contain">Full to Fit</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Upload Thumbnail</label>
                                          <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const fd = new FormData(); fd.append('file', file); try { const r = await fetch(`${API_URL}/cms/upload`, {method:'POST', body:fd}); const d = await r.json(); const ni=[...editingSection.data.items]; ni[itemIdx].src=d.url; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); } catch { const reader=new FileReader(); reader.onloadend=()=>{ const ni=[...editingSection.data.items]; ni[itemIdx].src=reader.result; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }; reader.readAsDataURL(file); }}} className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100" />
                                        </div>
                                        {item.src && <div className="col-span-2 h-24 rounded overflow-hidden border border-gray-300"><img src={item.src} className="w-full h-full object-cover" /></div>}
                                        
                                        <div className="col-span-2">
                                          <label className="block text-xs font-semibold mb-1">Reel Video URL (.mp4)</label>
                                          <input type="text" placeholder="https://res.cloudinary.com/.../reel.mp4" value={item.reelUrl||''} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].reelUrl=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" />
                                          <span className="text-[10px] text-gray-400 block mt-1">If provided, this reel video will autoplay in place of the thumbnail.</span>
                                        </div>
                                        
                                        <div className="col-span-2">
                                          <label className="block text-xs font-semibold mb-1">Or Upload Reel Video</label>
                                          <input type="file" accept="video/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const fd = new FormData(); fd.append('file', file); try { const r = await fetch(`${API_URL}/cms/upload`, {method:'POST', body:fd}); const d = await r.json(); const ni=[...editingSection.data.items]; ni[itemIdx].reelUrl=d.url; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); } catch { const reader=new FileReader(); reader.onloadend=()=>{ const ni=[...editingSection.data.items]; ni[itemIdx].reelUrl=reader.result; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }; reader.readAsDataURL(file); }}} className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100" />
                                        </div>
                                        
                                        <div className="col-span-2">
                                          <label className="block text-xs font-semibold mb-1">Direct Instagram URL</label>
                                          <input type="text" placeholder="https://instagram.com/reel/..." value={item.link||''} onChange={(e) => { const ni=[...editingSection.data.items]; ni[itemIdx].link=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,items:ni}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  <button onClick={() => setEditingSection({...editingSection, data:{...editingSection.data, items:[...editingSection.data.items, {src:'', link:'', reelUrl:'', fitMode:'cover'}]}})} className="w-full bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-300 text-gray-700 py-2 rounded text-xs font-bold">+ Add Block</button>
                                </div>
                              )}

                              {/* Special editor: Available on Platforms */}
                              {editingSection.id.startsWith('available_on_platforms') && Array.isArray(editingSection.data?.platforms) && (
                                <div className="space-y-4 mt-4">
                                  {editingSection.data.platforms.map((platform: any, pIdx: number) => (
                                    <div key={pIdx} className="border border-gray-200 p-4 rounded-md bg-gray-50 space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                        <h4 className="font-bold text-sm">Platform {pIdx + 1}</h4>
                                        <button onClick={() => { const np = [...editingSection.data.platforms]; np.splice(pIdx, 1); setEditingSection({...editingSection, data: {...editingSection.data, platforms: np}}); }} className="text-red-500 text-xs font-bold hover:underline">Remove</button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Platform Name</label>
                                          <input type="text" value={platform.name||''} onChange={(e) => { const np=[...editingSection.data.platforms]; np[pIdx].name=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,platforms:np}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-semibold mb-1">Link</label>
                                          <input type="text" value={platform.link||''} onChange={(e) => { const np=[...editingSection.data.platforms]; np[pIdx].link=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,platforms:np}}); }} className="w-full border border-gray-300 rounded p-2 text-xs" />
                                        </div>
                                        <div className="col-span-2">
                                          <label className="block text-xs font-semibold mb-1">Logo URL or Upload</label>
                                          <div className="flex space-x-2">
                                            <input 
                                              type="text" 
                                              value={platform.logo||''} 
                                              onChange={(e) => { const np=[...editingSection.data.platforms]; np[pIdx].logo=e.target.value; setEditingSection({...editingSection,data:{...editingSection.data,platforms:np}}); }} 
                                              placeholder="https://example.com/logo.png"
                                              className="flex-1 border border-gray-300 rounded p-2 text-xs" 
                                            />
                                            <input 
                                              type="file" 
                                              accept="image/*"
                                              id={`platform-logo-upload-${pIdx}`}
                                              className="hidden" 
                                              onChange={(e) => handlePlatformLogoUpload(e, pIdx)}
                                            />
                                            <button 
                                              onClick={() => document.getElementById(`platform-logo-upload-${pIdx}`)?.click()}
                                              className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-3 py-2 rounded text-xs font-semibold flex items-center space-x-1 whitespace-nowrap"
                                              disabled={uploadingPlatformLogoIndex === pIdx}
                                            >
                                              <Upload className="w-3.5 h-3.5" />
                                              <span>{uploadingPlatformLogoIndex === pIdx ? 'Uploading...' : 'Upload'}</span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  <button onClick={() => setEditingSection({...editingSection, data:{...editingSection.data, platforms:[...editingSection.data.platforms, {name:'New Platform', logo:'', link:''}]}})} className="w-full bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-300 text-gray-700 py-2 rounded text-xs font-bold">+ Add Platform</button>
                                </div>
                              )}

                              {/* Special editor: Quiz Banner */}
                              {editingSection.id.startsWith('quiz_banner') && (
                                <div className="space-y-6 mt-4 border-t border-gray-200 pt-4">
                                  <h4 className="font-bold text-sm text-gray-700">Quiz Content Settings</h4>
                                  
                                  {/* Questions Editor */}
                                  <div className="space-y-4">
                                    <h5 className="font-semibold text-xs text-gray-600">Questions</h5>
                                    {editingSection.data.questions?.map((q: any, qIdx: number) => (
                                      <div key={qIdx} className="border border-gray-200 p-3 rounded bg-white space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs font-bold">Question {qIdx + 1}</span>
                                          <button onClick={() => {
                                            const nq = [...editingSection.data.questions];
                                            nq.splice(qIdx, 1);
                                            setEditingSection({...editingSection, data: {...editingSection.data, questions: nq}});
                                          }} className="text-red-500 text-xs hover:underline">Remove</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div className="col-span-2">
                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Question Text</label>
                                            <input type="text" value={q.question || ''} onChange={(e) => {
                                              const nq = [...editingSection.data.questions];
                                              nq[qIdx].question = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, questions: nq}});
                                            }} className="w-full border border-gray-300 rounded p-1.5 text-xs" />
                                          </div>
                                          <div>
                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Internal Key</label>
                                            <input type="text" value={q.key || ''} onChange={(e) => {
                                              const nq = [...editingSection.data.questions];
                                              nq[qIdx].key = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, questions: nq}});
                                            }} className="w-full border border-gray-300 rounded p-1.5 text-xs" />
                                          </div>
                                          <div className="col-span-2">
                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Options (comma separated)</label>
                                            <input type="text" value={q.options?.join(', ') || ''} onChange={(e) => {
                                              const nq = [...editingSection.data.questions];
                                              nq[qIdx].options = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                              setEditingSection({...editingSection, data: {...editingSection.data, questions: nq}});
                                            }} className="w-full border border-gray-300 rounded p-1.5 text-xs" />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    <button onClick={() => {
                                      const nq = editingSection.data.questions ? [...editingSection.data.questions] : [];
                                      nq.push({ key: 'newKey', question: 'New Question?', options: ['Option 1', 'Option 2'] });
                                      setEditingSection({...editingSection, data: {...editingSection.data, questions: nq}});
                                    }} className="w-full bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-300 text-gray-700 py-1.5 rounded text-xs font-bold">+ Add Question</button>
                                  </div>

                                  {/* Recommendations Editor */}
                                  <div className="space-y-4">
                                    <h5 className="font-semibold text-xs text-gray-600">Recommendations Mapping</h5>
                                    {editingSection.data.recommendations?.map((rec: any, rIdx: number) => (
                                      <div key={rIdx} className="border border-gray-200 p-3 rounded bg-white space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs font-bold">Rule {rIdx + 1}</span>
                                          <button onClick={() => {
                                            const nr = [...editingSection.data.recommendations];
                                            nr.splice(rIdx, 1);
                                            setEditingSection({...editingSection, data: {...editingSection.data, recommendations: nr}});
                                          }} className="text-red-500 text-xs hover:underline">Remove</button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                          <div>
                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Condition Key</label>
                                            <input type="text" value={rec.conditionKey || ''} onChange={(e) => {
                                              const nr = [...editingSection.data.recommendations];
                                              nr[rIdx].conditionKey = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, recommendations: nr}});
                                            }} className="w-full border border-gray-300 rounded p-1.5 text-xs" placeholder="e.g. concern, or 'default'" />
                                          </div>
                                          <div>
                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Condition Value</label>
                                            <input type="text" value={rec.conditionValue || ''} onChange={(e) => {
                                              const nr = [...editingSection.data.recommendations];
                                              nr[rIdx].conditionValue = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, recommendations: nr}});
                                            }} className="w-full border border-gray-300 rounded p-1.5 text-xs" />
                                          </div>
                                          <div>
                                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Product SKU</label>
                                            <input type="text" value={rec.productSku || ''} onChange={(e) => {
                                              const nr = [...editingSection.data.recommendations];
                                              nr[rIdx].productSku = e.target.value;
                                              setEditingSection({...editingSection, data: {...editingSection.data, recommendations: nr}});
                                            }} className="w-full border border-gray-300 rounded p-1.5 text-xs font-mono" />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    <button onClick={() => {
                                      const nr = editingSection.data.recommendations ? [...editingSection.data.recommendations] : [];
                                      nr.push({ conditionKey: '', conditionValue: '', productSku: '' });
                                      setEditingSection({...editingSection, data: {...editingSection.data, recommendations: nr}});
                                    }} className="w-full bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-300 text-gray-700 py-1.5 rounded text-xs font-bold">+ Add Rule</button>
                                  </div>
                                </div>
                              )}

                              {/* Special editor: Best Sellers */}
                              {editingSection.id.startsWith('best_sellers') && (
                                <div className="space-y-4 mt-4">
                                  <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                                    <input 
                                      type="text" 
                                      value={editingSection.data.title || ''} 
                                      onChange={(e) => setEditingSection({
                                        ...editingSection,
                                        data: { ...editingSection.data, title: e.target.value }
                                      })} 
                                      className="w-full border border-gray-300 rounded p-2 text-xs" 
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Subtitle</label>
                                    <input 
                                      type="text" 
                                      value={editingSection.data.subtitle || ''} 
                                      onChange={(e) => setEditingSection({
                                        ...editingSection,
                                        data: { ...editingSection.data, subtitle: e.target.value }
                                      })} 
                                      className="w-full border border-gray-300 rounded p-2 text-xs" 
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Description Line</label>
                                    <textarea 
                                      rows={2}
                                      value={editingSection.data.description || ''} 
                                      onChange={(e) => setEditingSection({
                                        ...editingSection,
                                        data: { ...editingSection.data, description: e.target.value }
                                      })} 
                                      className="w-full border border-gray-300 rounded p-2.5 text-xs outline-none focus:ring-1 focus:ring-[#008060] focus:border-[#008060]" 
                                    />
                                  </div>
                                  
                                  <div className="border-t pt-4">
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Showcased Products ({editingSection.data.productIds?.length || 0})</label>

                                    {/* 🆕 Show by Category — auto-displays ALL products from that category */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 space-y-2">
                                      <label className="block text-xs font-bold text-blue-700">📂 Show Entire Category (Auto)</label>
                                      <p className="text-[10px] text-blue-600">Category select karo — us category ke SAARE products automatically show honge (manually add karne ki zarurat nahi).</p>
                                      <div className="flex gap-2">
                                        <select
                                          value={editingSection.data.categorySlug || ''}
                                          onChange={(e) => {
                                            setEditingSection({
                                              ...editingSection,
                                              data: { ...editingSection.data, categorySlug: e.target.value }
                                            });
                                          }}
                                          className="flex-1 border border-blue-300 rounded p-2 text-xs bg-white focus:border-blue-500 outline-none"
                                        >
                                          <option value="">-- Manual Selection (No Category) --</option>
                                          <option value="womens-care">Women's Care</option>
                                          <option value="wellness-category">Wellness Category</option>
                                          <option value="mother-care">MOTHER Care</option>
                                          <option value="men-care">Men Care</option>
                                          <option value="hair-care">Hair Care</option>
                                          <option value="face-and-body">Face and Body</option>
                                          <option value="attar-and-toners">Attar and Toners</option>
                                          <option value="baby-care-range">Baby Care Range</option>
                                        </select>
                                        {editingSection.data.categorySlug && (
                                          <button
                                            onClick={() => setEditingSection({
                                              ...editingSection,
                                              data: { ...editingSection.data, categorySlug: '' }
                                            })}
                                            className="bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded text-xs font-bold"
                                          >
                                            Clear
                                          </button>
                                        )}
                                      </div>
                                      {editingSection.data.categorySlug && (
                                        <p className="text-[10px] text-green-600 font-semibold">✅ Category mode ON — is category ke saare products dikhengen.</p>
                                      )}
                                    </div>

                                    {/* Manual Product Selection (only shown when no categorySlug) */}
                                    {!editingSection.data.categorySlug && (
                                      <>
                                    {/* Select Product to Add */}
                                    <div className="flex gap-2 mb-4">
                                      <select 
                                        id="bestseller-add-product"
                                        className="flex-1 border border-gray-300 rounded p-2 text-xs bg-white"
                                        defaultValue=""
                                      >
                                        <option value="" disabled>-- Select Product to Add --</option>
                                        {productsList
                                          .filter(p => !editingSection.data.productIds?.includes(p.id))
                                          .map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                          ))
                                        }
                                      </select>
                                      <button 
                                        onClick={() => {
                                          const selectEl = document.getElementById('bestseller-add-product') as HTMLSelectElement;
                                          const val = selectEl?.value;
                                          if (val) {
                                            const currentIds = editingSection.data.productIds || [];
                                            setEditingSection({
                                              ...editingSection,
                                              data: { ...editingSection.data, productIds: [...currentIds, val] }
                                            });
                                            selectEl.value = "";
                                          }
                                        }}
                                        className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded text-xs font-bold"
                                      >
                                        Add
                                      </button>
                                    </div>
                                    </>
                                    )}

                                    {/* List of Showcase Products with sorting and removal */}
                                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                      {(editingSection.data.productIds || []).map((prodId: string, idx: number) => {
                                        const prod = productsList.find(p => p.id === prodId);
                                        return (
                                          <div key={prodId} className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-xs shadow-sm">
                                            <div className="truncate max-w-[200px] font-medium text-gray-700">
                                              {prod ? prod.name : `Product ID: ${prodId}`}
                                            </div>
                                            <div className="flex items-center space-x-1">
                                              <button 
                                                onClick={() => {
                                                  const newIds = [...editingSection.data.productIds];
                                                  // Swap item up
                                                  const temp = newIds[idx];
                                                  newIds[idx] = newIds[idx - 1];
                                                  newIds[idx - 1] = temp;
                                                  setEditingSection({
                                                    ...editingSection,
                                                    data: { ...editingSection.data, productIds: newIds }
                                                  });
                                                }}
                                                disabled={idx === 0}
                                                className={`p-1.5 rounded ${idx === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                                              >
                                                ▲
                                              </button>
                                              <button 
                                                onClick={() => {
                                                  const newIds = [...editingSection.data.productIds];
                                                  // Swap item down
                                                  const temp = newIds[idx];
                                                  newIds[idx] = newIds[idx + 1];
                                                  newIds[idx + 1] = temp;
                                                  setEditingSection({
                                                    ...editingSection,
                                                    data: { ...editingSection.data, productIds: newIds }
                                                  });
                                                }}
                                                disabled={idx === editingSection.data.productIds.length - 1}
                                                className={`p-1.5 rounded ${idx === editingSection.data.productIds.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                                              >
                                                ▼
                                              </button>
                                              <button 
                                                onClick={() => {
                                                  const newIds = editingSection.data.productIds.filter((id: string) => id !== prodId);
                                                  setEditingSection({
                                                    ...editingSection,
                                                    data: { ...editingSection.data, productIds: newIds }
                                                  });
                                                }}
                                                className="text-red-500 hover:bg-red-50 p-1.5 rounded font-bold"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                      {(!editingSection.data.productIds || editingSection.data.productIds.length === 0) && (
                                        <p className="text-xs text-gray-400 italic text-center py-4">No products selected. Showing automatic Best Sellers by default.</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {Object.entries(editingSection.data).map(([key, value]) => {
                                if (key === 'image' || key === 'videoImage' || key === 'slides' || key === 'sliderInterval' || key === 'items' || key === 'mediaType' || key === 'productIds') return null; // Handled by uploader or specially
                                if (typeof value !== 'string') return null; // Only simple text fields for now
                                return (
                                  <div key={key}>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                    <textarea
                                      rows={key.toLowerCase().includes('description') || key.toLowerCase().includes('text') ? 4 : 1}
                                      value={value}
                                      onChange={(e) => {
                                        setEditingSection({
                                          ...editingSection,
                                          data: { ...editingSection.data, [key]: e.target.value }
                                        });
                                      }}
                                      className="w-full border border-gray-300 rounded p-2.5 text-xs focus:ring-1 focus:ring-[#008060] focus:border-[#008060] outline-none"
                                    />
                                  </div>
                                );
                              })}
                            </div>

                            {editingSection.id !== 'hero_banner' && editingSection.id !== 'our_story' && (
                              <div className="pt-2 border-t border-gray-200 mt-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Upload Section Image</label>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        let replacedSelection = false;
                                        
                                        // 1. Try to replace highlighted text in JSON editor
                                        if (showJsonEditor && jsonEditorRef.current) {
                                           const start = jsonEditorRef.current.selectionStart;
                                           const end = jsonEditorRef.current.selectionEnd;
                                           if (start !== end) {
                                             const currentJson = JSON.stringify(editingSection.data, null, 2);
                                             const highlightedText = currentJson.substring(start, end);
                                             
                                             let replacementUrl = reader.result as string;
                                             // Preserve quotes if they were highlighted
                                             if (highlightedText.startsWith('"') && highlightedText.endsWith('"')) {
                                                replacementUrl = `"${replacementUrl}"`;
                                             } else if (highlightedText.startsWith("'") && highlightedText.endsWith("'")) {
                                                replacementUrl = `'${replacementUrl}'`;
                                             }
                                             
                                             const newJsonString = currentJson.substring(0, start) + replacementUrl + currentJson.substring(end);
                                             
                                             try {
                                               const parsed = JSON.parse(newJsonString);
                                               setEditingSection({
                                                 ...editingSection,
                                                 data: parsed
                                               });
                                               replacedSelection = true;
                                             } catch (err) {
                                               console.warn("Invalid JSON after replacing highlighted text, falling back to smart replace.");
                                             }
                                           }
                                        }
                                        
                                        // 2. Fallback: Smartly find the first image URL and replace it
                                        if (!replacedSelection) {
                                          let updatedData = { ...editingSection.data };
                                          let replaced = false;
                                          const replaceFirstUrl = (obj: any) => {
                                            if (replaced) return;
                                            for (const key in obj) {
                                              if (typeof obj[key] === 'string' && (key === 'image' || key === 'img' || key === 'mediaUrl' || key === 'videoImage' || obj[key].startsWith('http'))) {
                                                obj[key] = reader.result;
                                                replaced = true;
                                                return;
                                              } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                                                replaceFirstUrl(obj[key]);
                                              }
                                            }
                                          };
                                          
                                          const dataCopy = JSON.parse(JSON.stringify(updatedData));
                                          replaceFirstUrl(dataCopy);
                                          
                                          if (replaced) {
                                            updatedData = dataCopy;
                                          } else {
                                            updatedData.image = reader.result; // Fallback if no URL found
                                          }
                                          
                                          setEditingSection({
                                            ...editingSection,
                                            data: updatedData
                                          });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="block w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                                />
                              </div>
                            )}

                            {/* JSON Editor Toggle */}
                            <div className="pt-4 border-t border-gray-200 mt-4">
                              <button 
                                onClick={() => setShowJsonEditor(!showJsonEditor)}
                                className="text-[10px] uppercase font-bold text-gray-500 hover:text-black tracking-wider flex items-center space-x-1"
                              >
                                <span>{showJsonEditor ? 'Hide' : 'Show'} Advanced Code Editor (JSON)</span>
                              </button>

                              {showJsonEditor && (
                                <div className="mt-3">
                                  <textarea
                                    ref={jsonEditorRef}
                                    rows={10}
                                    value={JSON.stringify(editingSection.data, null, 2)}
                                    onChange={(e) => {
                                      try {
                                        const parsed = JSON.parse(e.target.value);
                                        setEditingSection({ ...editingSection, data: parsed });
                                      } catch (_) {} // Don't crash on invalid JSON input while typing
                                    }}
                                    className="w-full font-mono text-[11px] p-3 border border-gray-300 bg-gray-50 rounded outline-none"
                                  />
                                </div>
                              )}
                            </div>
                            </>
                            ) : (
                              <div className="space-y-6">
                                <h3 className="text-sm font-semibold border-b pb-2">Design & Theme</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  
                                  <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Background Color</label>
                                    <div className="flex items-center space-x-2">
                                      <input 
                                        type="color" 
                                        value={editingSection.styles?.backgroundColor || '#ffffff'}
                                        onChange={(e) => setEditingSection({...editingSection, styles: {...editingSection.styles, backgroundColor: e.target.value}})}
                                        className="h-8 w-8 rounded border border-gray-300 cursor-pointer"
                                      />
                                      <input 
                                        type="text" 
                                        value={editingSection.styles?.backgroundColor || ''}
                                        placeholder="Transparent or #Hex"
                                        onChange={(e) => setEditingSection({...editingSection, styles: {...editingSection.styles, backgroundColor: e.target.value}})}
                                        className="flex-1 border border-gray-300 rounded p-2 text-xs"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Text Color (Typography)</label>
                                    <div className="flex items-center space-x-2">
                                      <input 
                                        type="color" 
                                        value={editingSection.styles?.textColor || '#000000'}
                                        onChange={(e) => setEditingSection({...editingSection, styles: {...editingSection.styles, textColor: e.target.value}})}
                                        className="h-8 w-8 rounded border border-gray-300 cursor-pointer"
                                      />
                                      <input 
                                        type="text" 
                                        value={editingSection.styles?.textColor || ''}
                                        placeholder="Inherit or #Hex"
                                        onChange={(e) => setEditingSection({...editingSection, styles: {...editingSection.styles, textColor: e.target.value}})}
                                        className="flex-1 border border-gray-300 rounded p-2 text-xs"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Font Family</label>
                                    <select 
                                      value={editingSection.styles?.fontFamily || 'inherit'}
                                      onChange={(e) => setEditingSection({...editingSection, styles: {...editingSection.styles, fontFamily: e.target.value}})}
                                      className="w-full border border-gray-300 rounded p-2 text-xs"
                                    >
                                      <option value="inherit">Theme Default</option>
                                      <option value="font-serif">Serif (Luxury/Elegant)</option>
                                      <option value="font-sans">Sans-Serif (Modern/Clean)</option>
                                      <option value="font-mono">Monospace (Technical)</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Content Alignment</label>
                                    <div className="flex bg-gray-100 rounded p-1">
                                      {['left', 'center', 'right'].map((align) => (
                                        <button
                                          key={align}
                                          onClick={() => setEditingSection({...editingSection, styles: {...editingSection.styles, textAlignment: align}})}
                                          className={`flex-1 text-xs py-1.5 capitalize rounded-sm transition-all ${editingSection.styles?.textAlignment === align ? 'bg-white shadow font-bold text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                          {align}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-4 flex justify-end space-x-3">
                            <button 
                              onClick={() => setEditingSection(null)}
                              className="px-4 py-2 bg-white border border-[#CCCCCC] rounded text-xs"
                            >
                              Discard
                            </button>
                            <button 
                              onClick={() => {
                                const asObject: Record<string, any> = {};
                                const newLayout = homepageLayout.map(s => s.id === editingSection.id ? editingSection : s);
                                newLayout.forEach(s => { asObject[s.id] = s; });
                                const targetLayoutKey = getDraftLayoutKey(currentPageId);
                                
                                setHomepageLayout(newLayout);
                                try { localStorage.setItem(`dc_draft_layout_${currentPageId}`, JSON.stringify(newLayout)); } catch (_) {}
                                setEditingSection(null);

                                set(ref(db, targetLayoutKey), asObject)
                                  .then(() => setHasUnpublishedChanges(true))
                                  .catch(err => {
                                    console.error("Firebase save error:", err);
                                    alert("Saved locally! Firebase sync failed, it will sync next time.");
                                  });
                              }}
                              className="px-6 py-2 bg-[#008060] hover:bg-[#006e52] text-white rounded text-xs font-bold"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center pb-2">
                            <h3 className="font-bold text-xs uppercase text-gray-500 tracking-wider">Page Sections</h3>
                            <button 
                              onClick={() => setShowAddSectionModal(true)}
                              className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded text-xs font-semibold flex items-center gap-2"
                            >
                              <Plus className="h-3 w-3" /> Add Section
                            </button>
                          </div>
                          
                          {homepageLayout.length > 0 ? (
                            [...homepageLayout].sort((a, b) => a.order - b.order).map((section, idx, arr) => (
                              <div key={section.id} className="bg-white border border-[#D2D2D2] rounded-lg p-4 flex items-center justify-between shadow-sm hover:border-gray-400 transition-all">
                                <div className="flex items-center space-x-3">
                                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                    <Layers className="h-4 w-4 text-gray-500" />
                                  </div>
                                  <div>
                                    <span className="font-bold text-xs text-gray-900 block capitalize">{section.id.replace(/_/g, ' ')}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">Order: {section.order} | {section.visible ? 'Show' : 'Hide'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                   <button 
                                     onClick={() => handleMoveSection(section.id, 'up')}
                                     disabled={idx === 0}
                                     className={`p-1.5 rounded transition-colors ${
                                       idx === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                                     }`}
                                     title="Move Up"
                                   >
                                     ▲
                                   </button>
                                   <button 
                                     onClick={() => handleMoveSection(section.id, 'down')}
                                     disabled={idx === arr.length - 1}
                                     className={`p-1.5 rounded transition-colors ${
                                       idx === arr.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                                     }`}
                                     title="Move Down"
                                   >
                                     ▼
                                   </button>
                                   <button 
                                     onClick={() => {
                                       const updated = homepageLayout.map(s =>
                                         s.id === section.id ? { ...s, visible: !s.visible } : s
                                       );
                                       setHomepageLayout(updated);
                                       const asObject: Record<string, any> = {};
                                       updated.forEach(s => { asObject[s.id] = s; });
                                       const targetLayoutKey = getDraftLayoutKey(currentPageId);
                                       set(ref(db, targetLayoutKey), asObject);
                                     }}
                                     className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                                       section.visible
                                         ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                         : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                                     }`}
                                   >
                                     {section.visible ? 'Visible' : 'Hidden'}
                                   </button>
                                   <button 
                                     onClick={() => {
                                       let editableSection = {...section};
                                       if (editableSection.id === 'hero_banner' && !Array.isArray(editableSection.data?.slides)) {
                                         editableSection.data = {
                                           ...editableSection.data,
                                           slides: editableSection.data?.image ? [{
                                             id: 'legacy-slide',
                                             mediaType: 'image',
                                             mediaUrl: editableSection.data.image,
                                             title: editableSection.data.title,
                                             subtitle: editableSection.data.subtitle,
                                             description: editableSection.data.description,
                                             buttonText: editableSection.data.buttonText,
                                             buttonLink: editableSection.data.buttonLink
                                           }] : []
                                         };
                                       }
                                       setEditingSection(editableSection);
                                       setShowJsonEditor(false);
                                     }}
                                     className="px-3 py-1 bg-[#008060] hover:bg-[#006e52] text-white rounded text-[10px] font-bold"
                                   >
                                     Edit
                                   </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-16 px-4 bg-white border border-dashed border-gray-300 rounded-lg">
                              <Layers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                              <h3 className="text-sm font-bold text-gray-800">No Sections Added Yet</h3>
                              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">This page is currently empty. Click "Add Section" above to start building this page layout.</p>
                              <button 
                                onClick={() => setShowAddSectionModal(true)}
                                className="mt-4 bg-black text-white px-4 py-2 rounded text-xs font-semibold inline-flex items-center gap-2"
                              >
                                <Plus className="h-3 w-3" /> Add First Section
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Live Preview Simulator */}
                    <div className={`xl:col-span-7 space-y-4 bg-[#FAF9F6] border border-gray-200 p-4 sm:p-6 rounded-lg ${
                      previewMode === 'edit' ? 'hidden' : 'block'
                    } ${
                      previewMode === 'preview' ? 'xl:col-span-12' : ''
                    }`}>
                      <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <span className="text-xs uppercase tracking-widest font-bold text-gray-500">
                          {previewDevice === 'mobile' ? 'Mobile Live Preview 📱' : 'Desktop Live Preview 🖥️'}
                        </span>
                        
                        <div className="text-[10px] text-gray-400 italic">
                          Real-time Preview (Draft Sandbox)
                        </div>
                      </div>

                      {/* Device viewport renderer */}
                      <div className="flex justify-center items-center py-4 bg-gray-100 rounded border border-gray-200 overflow-hidden min-h-[500px]">
                        {previewDevice === 'mobile' ? (
                          // Mobile phone device bezel mockup
                          <div className="relative w-[375px] h-[680px] bg-black rounded-[40px] shadow-2xl p-3 border-[6px] border-neutral-800 flex flex-col overflow-hidden">
                            {/* Speaker & camera slot */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-neutral-900 rounded-full z-30 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 bg-neutral-700 rounded-full mr-2" />
                              <span className="w-12 h-1 bg-neutral-800 rounded" />
                            </div>

                            {/* Inner Scroll screen */}
                            <div className="w-full h-full bg-white rounded-[28px] overflow-y-auto pt-6 scrollbar-thin">
                              {mockProductForClient && (
                                <ProductClient product={mockProductForClient} />
                              )}
                              <HomeClient 
                                banners={[]} 
                                bestSellers={[]} 
                                pageId={currentPageId} 
                                previewLayout={homepageLayout} 
                              />
                            </div>
                          </div>
                        ) : (
                          // Desktop View Mockup
                          <div className="w-full h-[680px] bg-white border border-gray-300 rounded shadow-md flex flex-col overflow-hidden">
                            {/* Browser titlebar */}
                            <div className="h-8 bg-gray-200 border-b border-gray-300 px-4 flex items-center space-x-1.5 select-none shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-400 block" />
                              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 block" />
                              <span className="w-2.5 h-2.5 rounded-full bg-green-400 block" />
                              <div className="text-gray-400 font-mono flex-1 overflow-hidden whitespace-nowrap px-4 tracking-wide text-left opacity-60">
                                https://divinecardinal.vercel.app{currentPageId?.startsWith('product-') ? `/products/${currentPageId.replace('product-', '')}` : `/pages/${currentPageId}`}
                              </div>
                            </div>

                            {/* Inner Scroll page */}
                            <div className="w-full h-full overflow-y-auto scrollbar-thin">
                              {mockProductForClient && (
                                <ProductClient product={mockProductForClient} />
                              )}
                              <HomeClient 
                                banners={[]} 
                                bestSellers={[]} 
                                pageId={currentPageId} 
                                previewLayout={homepageLayout} 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>


                  {/* Add Section Modal */}
                  {showAddSectionModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-lg font-bold">Add New Section</h2>
                          <button onClick={() => setShowAddSectionModal(false)}><X className="h-5 w-5 text-gray-500"/></button>
                        </div>
                        <div className="space-y-3">
                          {ALL_THEME_SECTIONS.map((template) => (
                            <div key={template.id} className="border border-gray-200 p-4 rounded hover:bg-gray-50 flex justify-between items-center">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-bold text-sm capitalize">{template._originalId.replace('_', ' ')}</h3>
                                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{template._themeName}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate w-64 mt-1">{(template.data as any).title || (template.data as any).heading || 'Custom Section'}</p>
                              </div>
                              <button 
                                onClick={() => handleAddPredefinedSection({ ...template, id: template._originalId })}
                                className="bg-[#008060] text-white px-3 py-1.5 rounded text-xs"
                              >
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Create New Page Modal */}
                  {showCreatePageModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-lg font-bold">Create New Page</h2>
                          <button onClick={() => setShowCreatePageModal(false)}><X className="h-5 w-5 text-gray-500"/></button>
                        </div>
                        <form onSubmit={handleCreatePage} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Page Title</label>
                            <input 
                              type="text" 
                              required
                              value={newPageForm.title}
                              onChange={(e) => setNewPageForm({ ...newPageForm, title: e.target.value })}
                              className="w-full border border-gray-300 rounded p-2 text-sm"
                              placeholder="e.g., About Us"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">URL Slug</label>
                            <div className="flex items-center border border-gray-300 rounded p-2 text-sm bg-gray-50">
                              <span className="text-gray-500 mr-1">/pages/</span>
                              <input 
                                type="text" 
                                required
                                value={newPageForm.slug}
                                onChange={(e) => setNewPageForm({ ...newPageForm, slug: e.target.value })}
                                className="w-full bg-transparent outline-none"
                                placeholder="about-us"
                              />
                            </div>
                          </div>
                          <div className="pt-2 flex justify-end space-x-3">
                            <button 
                              type="button"
                              onClick={() => setShowCreatePageModal(false)}
                              className="px-4 py-2 border border-gray-300 rounded text-sm"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="px-6 py-2 bg-black text-white rounded text-sm font-bold"
                            >
                              Create Page
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'global_ui' && <GlobalUIBuilder />}
              {activeTab === 'ingredients' && <IngredientsBuilder />}
              {activeTab === 'discounts' && <DiscountsBuilder />}
              {activeTab === 'integrations' && <IntegrationsBuilder />}
              {activeTab === 'seo' && <SeoConsole products={productsList} />}
              {activeTab === 'ai_builder' && <AIPageBuilder />}
              {activeTab === 'theme_store' && <ThemeStore />}
            </>
          )}
        </main>
      </div>

      {/* 5. MODAL: ORDER DETAILS / FULFILLMENT CONTROLLER */}
      {showOrderDetailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-300 w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#EAEAEA] pb-3">
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-lg font-semibold text-luxury-charcoal">Order {showOrderDetailModal.id}</h2>
                <span className="bg-gray-100 text-gray-600 text-[9px] px-1.5 py-0.5 rounded font-mono">
                  {showOrderDetailModal.date}
                </span>
              </div>
              <button 
                onClick={() => setShowOrderDetailModal(null)}
                className="text-gray-400 hover:text-black font-semibold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-[#FAF9F6] pb-3">
                <div>
                  <span className="text-gray-500 block">Customer</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">{showOrderDetailModal.customer}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Total Amount</span>
                  <span className="font-semibold text-gray-900 block mt-0.5">₹{showOrderDetailModal.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Interactive Status Modifiers */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-gray-700 uppercase tracking-wider text-[9px]">Fulfillment & Status Control</h3>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 block">Payment Status</label>
                  <select 
                    value={showOrderDetailModal.paymentStatus} 
                    onChange={(e) => handleUpdateOrderStatus(showOrderDetailModal.id, 'paymentStatus', e.target.value)}
                    className="w-full border border-[#CCCCCC] rounded px-3 py-1.5 outline-none bg-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 block">Fulfillment Status</label>
                  <select 
                    value={showOrderDetailModal.fulfillmentStatus} 
                    onChange={(e) => handleUpdateOrderStatus(showOrderDetailModal.id, 'fulfillmentStatus', e.target.value)}
                    className="w-full border border-[#CCCCCC] rounded px-3 py-1.5 outline-none bg-white"
                  >
                    <option value="Fulfilled">Fulfilled</option>
                    <option value="Unfulfilled">Unfulfilled</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 block">Delivery Status</label>
                  <select 
                    value={showOrderDetailModal.deliveryStatus} 
                    onChange={(e) => handleUpdateOrderStatus(showOrderDetailModal.id, 'deliveryStatus', e.target.value)}
                    className="w-full border border-[#CCCCCC] rounded px-3 py-1.5 outline-none bg-white"
                  >
                    <option value="Delivered">Delivered</option>
                    <option value="Processing">Processing</option>
                    <option value="In Transit">In Transit</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-[#EAEAEA]">
                <button 
                  type="button" 
                  onClick={() => setShowOrderDetailModal(null)}
                  className="bg-black text-white hover:bg-gray-800 px-5 py-2 rounded text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
