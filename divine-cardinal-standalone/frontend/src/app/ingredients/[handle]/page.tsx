import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { INGREDIENT_DICTIONARY, parseProductIngredients } from '../../../lib/ingredients';
import { optimizeCloudinaryUrl } from '../../../lib/cloudinary';
import './ingredient-page.css';

export const dynamic = 'force-dynamic';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  let ingredient = null;
  try {
    const API_URL = 'https://kalvix-nexus-production.up.railway.app/api';
    const res = await fetchWithTimeout(`${API_URL}/cms/layout/ingredients`, { cache: 'no-store' }, 2500);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
        ingredient = list.find(i => i.id === handle);
      }
    }
  } catch (e) {
    console.error('Metadata fetch timed out or failed:', e);
  }
  
  if (!ingredient) {
    ingredient = INGREDIENT_DICTIONARY.find(i => i.id === handle);
  }
  
  if (!ingredient) {
    return { title: 'Ingredient Not Found' };
  }

  return {
    title: `${ingredient.name} Benefits & Products - Kalvix Nexus`,
    description: ingredient.description,
  };
}

export default async function IngredientDetail({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  
  let ingredient = null;
  let allIngredients = INGREDIENT_DICTIONARY;
  try {
    const API_URL = 'https://kalvix-nexus-production.up.railway.app/api';
    const res = await fetchWithTimeout(`${API_URL}/cms/layout/ingredients`, { cache: 'no-store' }, 2500);
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list)) {
        allIngredients = list;
        ingredient = list.find(i => i.id === handle);
      }
    }
  } catch (e) {
    console.error('Ingredient details fetch timed out or failed:', e);
  }

  if (!ingredient) {
    ingredient = INGREDIENT_DICTIONARY.find(i => i.id === handle);
  }

  if (!ingredient) {
    notFound();
  }

  // Fetch all products from CMS to find which ones contain this ingredient
  let productsContaining: any[] = [];
  try {
    const API_URL = 'https://kalvix-nexus-production.up.railway.app/api';
    const res = await fetchWithTimeout(`${API_URL}/products?limit=1000`, { cache: 'no-store' }, 2500);
    if (res.ok) {
      const data = await res.json();
      const products = data.products || data.data || data;
      if (Array.isArray(products)) {
        productsContaining = products.filter((p: any) => {
          const ingredients = parseProductIngredients(p.keyIngredients, allIngredients, p.sku || p.id, p.name);
          return ingredients.some(i => i.id === handle);
        });
      }
    }
  } catch (error) {
    console.error("Error fetching products for ingredient page (timeout or error):", error);
  }

  // Fallbacks for data fields
  const heroImage = ingredient.heroImage || ingredient.image || 'https://divinecardinal.com/cdn/shop/files/eucalyptus_oil.jpg';
  const sku = ingredient.sku || 'N/A';
  const femaNumber = ingredient.femaNumber || 'N/A';
  const casNumber = ingredient.casNumber || 'N/A';
  const category = ingredient.category || ingredient.type || 'Essential Oil';
  const botanicalName = ingredient.botanicalName || ingredient.name;
  const plantParts = ingredient.plantParts || 'N/A';
  const extractionMethod = ingredient.extractionMethod || 'N/A';
  const history = ingredient.history || ingredient.historicalSignificance || '';
  const therapeuticProperties = ingredient.therapeuticProperties || '';
  const specifications = Array.isArray(ingredient.specifications) && ingredient.specifications.length > 0 
    ? ingredient.specifications 
    : [];
  const faqs = Array.isArray(ingredient.faqs) ? ingredient.faqs : [];

  return (
    <div className="ingredient-page-wrapper">
      
      {/* ═══ BREADCRUMB ════════════════════════════════════════════════ */}
      <div className="breadcrumb">
        <nav aria-label="Breadcrumb">
          <ol itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link itemProp="item" href="/"><span itemProp="name">Home</span></Link>
              <meta itemProp="position" content="1" />
            </li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link itemProp="item" href="/collections/all"><span itemProp="name">All Products</span></Link>
              <meta itemProp="position" content="2" />
            </li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span itemProp="name">{ingredient.name}</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>
      </div>

      {/* ═══ HERO ══════════════════════════════════════════════════════ */}
      <main>
      <section className="ingredient-hero" aria-label={`${ingredient.name} Hero`}>
        <div className="hero-image-wrap">
          <span className="hero-badge">Therapeutic Grade</span>
          <img
            src={optimizeCloudinaryUrl(heroImage, 1000)}
            alt={ingredient.name}
            width="973" height="520"
            loading="eager"
          />
        </div>
        <div className="hero-info">
          <p className="hero-sku">SKU: {sku} &nbsp;|&nbsp; FEMA: {femaNumber} &nbsp;|&nbsp; CAS: {casNumber}</p>
          <p className="hero-category">{category}</p>
          <h1 className="hero-title">{ingredient.name}</h1>
          <p className="hero-botanical">{botanicalName}</p>
          <div className="hero-divider"></div>
          <p className="hero-intro">
            {ingredient.description}
          </p>
          <div className="hero-quick-props">
            <div className="qprop"><div className="qprop-label">Botanical Name</div><div className="qprop-value"><em>{botanicalName}</em></div></div>
            <div className="qprop"><div className="qprop-label">CAS Number</div><div className="qprop-value">{casNumber}</div></div>
            <div className="qprop"><div className="qprop-label">Extraction Method</div><div className="qprop-value">{extractionMethod}</div></div>
            <div className="qprop"><div className="qprop-label">Plant Part</div><div className="qprop-value">{plantParts}</div></div>
          </div>
          <div className="hero-cta-row">
            <a href={`mailto:care@divinecardinal.com?subject=Bulk Enquiry – ${ingredient.name}`} className="btn-primary">Request Bulk Quote</a>
            <Link href="/collections/all" className="btn-secondary">Buy Products</Link>
          </div>
        </div>
      </section>

      {/* ═══ FULL SPECIFICATIONS ════════════════════════════════════════ */}
      {specifications.length > 0 && (
        <section className="page-section" aria-labelledby="spec-heading">
          <div className="section-header">
            <span className="section-tag">Technical Data</span>
            <h2 className="section-title" id="spec-heading">Full Ingredient Specifications</h2>
          </div>
          <div className="spec-grid" role="table" aria-label={`${ingredient.name} Technical Specifications`}>
            {specifications.map((spec: any, idx: number) => (
              <div className="spec-row" role="row" key={idx}>
                <div role="rowheader">{spec.label}</div><div role="cell">{spec.value}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ HISTORY & ORIGIN ════════════════════════════════════════════ */}
      {history && (
        <section className="page-section" aria-labelledby="history-heading">
          <div className="history-layout">
            <div className="history-sidebar">
              <div className="section-header">
                <span className="section-tag">Botanical Heritage</span>
                <h2 className="section-title" id="history-heading">History &amp; Origin</h2>
              </div>
            </div>
            <div className="history-body">
              {history.split('\n').map((para: string, idx: number) => (
                para.trim() ? <p key={idx}>{para}</p> : null
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ THERAPEUTIC PROPERTIES ═════════════════════════════════════ */}
      {therapeuticProperties && (
        <section className="page-section" aria-labelledby="therapeutic-heading">
          <div className="section-header">
            <span className="section-tag">Pharmacological Profile</span>
            <h2 className="section-title" id="therapeutic-heading">Therapeutic Properties</h2>
          </div>
          <div className="therapeutics-grid">
            <div className="therapeutic-card w-full col-span-3">
              <div className="tc-body">{therapeuticProperties}</div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ FAQS ═════════════════════════════════════════════════════ */}
      {faqs.length > 0 && (
        <section className="page-section bg-gray-50/50" aria-labelledby="faqs-heading">
          <div className="section-header">
            <span className="section-tag">Expert Answers</span>
            <h2 className="section-title" id="faqs-heading">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-4xl space-y-4">
            {faqs.map((faq: any, idx: number) => (
              <div key={idx} className="bg-white border border-gray-200 p-6">
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mb-3">{faq.question}</h3>
                <p className="text-[#5A5A5A] text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ PRODUCTS GRID ═════════════════════════════════════════════ */}
      {productsContaining.length > 0 && (
        <section className="page-section" style={{ background: '#fafaf8' }}>
          <div className="section-header text-center mx-auto max-w-2xl">
            <span className="section-tag">Formulations</span>
            <h2 className="section-title">Products with {ingredient.name}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {productsContaining.map((product: any) => (
              <Link key={product.id} href={`/products/${product.handle}`} className="group text-left block">
                <div className="aspect-[4/5] bg-gray-50 mb-4 overflow-hidden relative border border-gray-200">
                  <img 
                    src={optimizeCloudinaryUrl(product.images?.[0]?.url, 400) || 'https://images.cloudinary.com/placeholder-bottle.jpg'} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h4 className="font-serif text-base text-[#1A1A1A] group-hover:text-[#b8933a] transition-colors">{product.name}</h4>
                <p className="text-xs text-[#888] mt-1 uppercase font-sans tracking-widest">{product.category}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      </main>
    </div>
  );
}
