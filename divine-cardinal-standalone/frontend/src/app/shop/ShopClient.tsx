'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Filter, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { optimizeCloudinaryUrl } from '../../lib/cloudinary';
import { getProductStats } from '../../lib/reviews';
import { useCurrency } from '../../context/CurrencyContext';
import HomeClient from '../HomeClient';
const parsePrice = (price: string | number | undefined | null): number => {
  if (price == null) return 0;
  if (typeof price === 'number') return price;
  const cleaned = String(price).replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
};
interface ShopClientProps {
  products: any[];
  initialParams: { category?: string; search?: string; sortBy?: string; ingredient?: string; concern?: string };
  categories?: any[];
  ingredients?: string[];
  concerns?: string[];
  layout?: any[];
}

export default function ShopClient({ products, initialParams, categories = [], ingredients = [], concerns = [], layout = [] }: ShopClientProps) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  const buildUrl = (key: string, value: string | null) => {
    const params = new URLSearchParams();
    if (initialParams.category) params.set('category', initialParams.category);
    if (initialParams.sortBy) params.set('sortBy', initialParams.sortBy);
    if (initialParams.search) params.set('search', initialParams.search);
    if (initialParams.ingredient) params.set('ingredient', initialParams.ingredient);
    if (initialParams.concern) params.set('concern', initialParams.concern);

    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const query = params.toString();
    return `/shop${query ? `?${query}` : ''}`;
  };

  const [openFilter, setOpenFilter] = React.useState<string | null>('Category');
  const toggleFilter = (filterName: string) => {
    setOpenFilter(prev => prev === filterName ? null : filterName);
  };

  const triggerFlyToCart = (e: React.MouseEvent | undefined) => {
    if (!e) return;
    const dot = document.createElement('div');
    dot.className = 'fixed w-4 h-4 bg-luxury-gold rounded-full z-50 pointer-events-none transition-all duration-700 ease-in-out';
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
    document.body.appendChild(dot);

    // Trigger reflow
    void dot.offsetWidth;

    dot.style.opacity = '0.2';

    setTimeout(() => {
      dot.remove();
    }, 2000);
  };

  const handleQuickAdd = (product: any, e?: React.MouseEvent) => {
    const variant = product.variants?.[0] || {};
    addItem({
      variantId: variant.id || variant.sku || product.id,
      quantity: 1,
      price: Number(product.basePrice || variant.price || 0),
      compareAtPrice: Number(product.compareAtPrice) || 0,
      name: product.name,
      sku: variant.sku || 'default-sku',
      image: product.images?.[0]?.url,
      variantTitle: variant.title || 'Standard',
    });
    triggerFlyToCart(e);
  };

  const dynamicCategories = [
    { label: 'All Products', slug: '' },
    ...categories.map(c => ({ label: c.name, slug: c.slug }))
  ];

  return (
    <div className="flex flex-col w-full">
      {layout && layout.length > 0 && (
        <div className="w-full -mb-24">
          <HomeClient banners={[]} bestSellers={[]} pageId="shop" initialLayout={layout} />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full mt-8">
      {/* Title */}
      <div className="border-b border-luxury-gold/15 pb-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between space-y-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-luxury-charcoal">The Apothecary Catalog</h1>
          <p className="text-xs text-luxury-gold tracking-widest uppercase mt-2 font-serif">Original botanical formulations</p>
        </div>
        
        {/* Sort Select */}
        <div className="flex items-center space-x-2">
          <span className="text-xs uppercase tracking-wider text-luxury-charcoal/60">Sort By</span>
          <select
            value={initialParams.sortBy || ''}
            onChange={(e) => {
              window.location.href = buildUrl('sortBy', e.target.value);
            }}
            className="bg-transparent border border-luxury-gold/30 rounded px-2 py-1.5 text-xs font-sans outline-none"
          >
            <option value="">Featured</option>
            <option value="price:asc">Price: Low to High</option>
            <option value="price:desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Category Filters (Left Sidebar) */}
        <div className="space-y-6">
          <div className="border border-luxury-gold/20 p-4">
            <button 
              onClick={() => toggleFilter('Category')}
              className="w-full flex items-center justify-between space-x-2 pb-2 border-b border-luxury-gold/10"
            >
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-luxury-gold" />
                <h3 className="font-serif text-sm tracking-widest uppercase">Category</h3>
              </div>
              <span className="text-luxury-gold">{openFilter === 'Category' ? '−' : '+'}</span>
            </button>
            {openFilter === 'Category' && (
              <ul className="space-y-3 text-sm mt-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                <li>
                  <Link
                    href={buildUrl('category', null)}
                    className={`hover:text-luxury-gold transition-colors block ${
                      !initialParams.category ? 'text-luxury-gold font-medium' : 'text-luxury-charcoal/75 font-light'
                    }`}
                  >
                    All Categories
                  </Link>
                </li>
                {categories.map((cat) => {
                  const isActive = (initialParams.category || '') === cat.slug;
                  return (
                    <li key={cat.slug || cat.name || cat.label}>
                      <Link
                        href={buildUrl('category', cat.slug)}
                        className={`hover:text-luxury-gold transition-colors block ${
                          isActive ? 'text-luxury-gold font-medium' : 'text-luxury-charcoal/75 font-light'
                        }`}
                      >
                        {cat.name || cat.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          
          {/* Ingredient Filter */}
          <div className="border border-luxury-gold/20 p-4">
            <button 
              onClick={() => toggleFilter('Ingredient')}
              className="w-full flex items-center justify-between space-x-2 pb-2 border-b border-luxury-gold/10"
            >
              <h3 className="font-serif text-sm tracking-widest uppercase text-luxury-charcoal/70">Ingredient</h3>
              <span className="text-luxury-gold">{openFilter === 'Ingredient' ? '−' : '+'}</span>
            </button>
            {openFilter === 'Ingredient' && (
              <ul className="space-y-3 text-sm mt-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                <li>
                  <Link
                    href={buildUrl('ingredient', null)}
                    className={`hover:text-luxury-gold transition-colors block ${
                      !initialParams.ingredient ? 'text-luxury-gold font-medium' : 'text-luxury-charcoal/75 font-light'
                    }`}
                  >
                    Any Ingredient
                  </Link>
                </li>
                {ingredients.map((item) => {
                  const isActive = (initialParams.ingredient || '').toLowerCase() === item.toLowerCase();
                  return (
                    <li key={item}>
                      <Link
                        href={buildUrl('ingredient', item)}
                        className={`hover:text-luxury-gold transition-colors block ${
                          isActive ? 'text-luxury-gold font-medium' : 'text-luxury-charcoal/75 font-light'
                        }`}
                      >
                        {item}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Concern Filter */}
          <div className="border border-luxury-gold/20 p-4">
            <button 
              onClick={() => toggleFilter('Concern')}
              className="w-full flex items-center justify-between space-x-2 pb-2 border-b border-luxury-gold/10"
            >
              <h3 className="font-serif text-sm tracking-widest uppercase text-luxury-charcoal/70">Concern</h3>
              <span className="text-luxury-gold">{openFilter === 'Concern' ? '−' : '+'}</span>
            </button>
            {openFilter === 'Concern' && (
              <ul className="space-y-3 text-sm mt-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                <li>
                  <Link
                    href={buildUrl('concern', null)}
                    className={`hover:text-luxury-gold transition-colors block ${
                      !initialParams.concern ? 'text-luxury-gold font-medium' : 'text-luxury-charcoal/75 font-light'
                    }`}
                  >
                    Any Concern
                  </Link>
                </li>
                {concerns.map((item) => {
                  const isActive = (initialParams.concern || '').toLowerCase() === item.toLowerCase();
                  return (
                    <li key={item}>
                      <Link
                        href={buildUrl('concern', item)}
                        className={`hover:text-luxury-gold transition-colors block ${
                          isActive ? 'text-luxury-gold font-medium' : 'text-luxury-charcoal/75 font-light'
                        }`}
                      >
                        {item}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Product Grid (Right) */}
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <p className="font-serif text-lg text-luxury-charcoal/60">No products found matching your search</p>
              <Link href="/shop" className="underline text-sm text-luxury-gold font-serif">
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="group flex flex-col bg-white border border-luxury-gold/10 p-4 luxury-card-shadow">
                  {/* Image */}
                  <Link href={`/products/${product.slug}`} className="relative h-60 bg-luxury-cream overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={optimizeCloudinaryUrl(product.images?.[0]?.url, 400) || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400'}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/80 p-2 rounded-full border border-luxury-gold/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="h-4 w-4 text-luxury-gold hover:fill-luxury-gold transition-colors cursor-pointer" />
                    </div>
                  </Link>

                  {/* Metadata */}
                  <div className="mt-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center space-x-1 text-xs text-yellow-600 mb-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-600" />
                        <span className="font-medium mr-1">{Number(product.rating || getProductStats(product.id).rating).toFixed(1)}</span>
                        <span className="text-[10px] text-luxury-charcoal/50">({product.reviewCount || getProductStats(product.id).reviewCount})</span>
                      </div>
                      <h3 className="font-serif text-sm tracking-wide text-luxury-charcoal group-hover:text-luxury-gold transition-colors">
                        <Link href={`/products/${product.slug}`}>{product.name}</Link>
                      </h3>
                      <p className="text-xs text-luxury-charcoal/60 line-clamp-2 mt-1 font-light leading-relaxed">
                        {product.summary}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {parsePrice(product.compareAtPrice) > parsePrice(product.basePrice) && (
                          <span className="text-xs line-through text-gray-500">{formatPrice(parsePrice(product.compareAtPrice))}</span>
                        )}
                        <span className="font-serif font-medium text-sm text-red-600">{formatPrice(parsePrice(product.basePrice))}</span>
                        {parsePrice(product.compareAtPrice) > parsePrice(product.basePrice) && (
                          <span className="text-xs text-green-600">Save {(parsePrice(product.compareAtPrice) - parsePrice(product.basePrice)).toFixed(0)}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="text-[10px] uppercase tracking-widest border border-luxury-gold px-3 py-1.5 hover:bg-luxury-gold hover:text-white transition-colors font-serif"
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
