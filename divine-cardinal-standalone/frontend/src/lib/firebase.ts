// Mock Firebase Adapter - Redirects Firebase RTDB calls to our Railway Postgres REST API
const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';

export const db = {};

export function ref(database: any, path: string) {
  return path;
}

export function push(reference: string) {
  return `${reference}/${Date.now().toString()}`;
}

export function child(reference: string, path: string) {
  return `${reference}/${path}`;
}

// Helper to convert array to Firebase object format
const toFirebaseObject = (arr: any[]) => {
  if (!arr || !Array.isArray(arr)) return null;
  const obj: any = {};
  arr.forEach(item => {
    if (item.id) obj[item.id] = item;
    else if (item.orderNumber) obj[item.orderNumber] = item;
    else if (item.slug) obj[item.slug] = item;
  });
  return Object.keys(obj).length > 0 ? obj : null;
};

const fetchPromises: Record<string, Promise<any> | undefined> = {};
const cache: Record<string, { data: any, timestamp: number }> = {};

export function onValue(reference: string, callback: (snapshot: any) => void, cancelCallback?: (error: Error) => void) {
  let isSubscribed = true;

  const fetchData = async () => {
    try {
      // 1. Check valid cache (60s TTL)
      if (cache[reference] && Date.now() - cache[reference].timestamp < 120000) {
        if (isSubscribed) {
          callback({ val: () => cache[reference].data, exists: () => cache[reference].data !== null && cache[reference].data !== undefined });
        }
        return;
      }

      // 2. Dedup concurrent requests
      if (!fetchPromises[reference]) {
        fetchPromises[reference] = (async () => {
          let data = null;
          if (reference === 'products') {
            const [res, extrasRes] = await Promise.all([
              fetch(`${API_URL}/admin/products`, { cache: 'no-store' }),
              fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/product_extras.json`, { cache: 'no-store' })
            ]);
            if (res.ok) {
              const baseData = await res.json();
              let extras: Record<string, any> = {};
              if (extrasRes.ok) extras = await extrasRes.json() || {};
              const mergedData = baseData.map((p: any) => ({ ...p, ...(extras[p.id] || {}) }));
              data = toFirebaseObject(mergedData);
            }
          } 
          else if (reference === 'orders') {
            const res = await fetch(`${API_URL}/admin/mock-orders`, { cache: 'no-store' });
            if (res.ok) data = toFirebaseObject(await res.json());
          }
          else if (reference === 'reviews') {
            const res = await fetch(`${API_URL}/admin/reviews`, { cache: 'no-store' });
            if (res.ok) data = toFirebaseObject(await res.json());
          }
          else if (reference === 'live_visits') {
            data = { "dummy": { user: "Admin", action: "System Active", timestamp: Date.now() } };
          }
          else if (reference === 'pages_registry') {
            const res = await fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/pages_registry.json`, { cache: 'no-store' });
            if (res.ok) data = await res.json();
          }
          else if (reference.startsWith('layouts/page-')) {
            const res = await fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/${reference}.json`, { cache: 'no-store' });
            if (res.ok) data = await res.json();
          }
          else if (reference.startsWith('globals/')) {
            const res = await fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/${reference}.json?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) data = await res.json();
          }
          else if (reference.startsWith('settings/')) {
            const res = await fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/${reference}.json`, { cache: 'no-store' });
            if (res.ok) data = await res.json();
          }
          else if (reference.includes('layout') || reference.startsWith('global_elements') || reference.startsWith('ingredients') || reference.startsWith('discounts') || reference.startsWith('integrations')) {
            const res = await fetch(`${API_URL}/cms/layout/${reference}`, { cache: 'no-store' });
            if (res.ok) data = await res.json();
          }
          return data;
        })();
      }

      const data = await fetchPromises[reference];
      cache[reference] = { data, timestamp: Date.now() };
      
      // Cleanup promise after cache is set
      delete fetchPromises[reference];

      if (isSubscribed) {
        callback({ val: () => data, exists: () => data !== null && data !== undefined });
      }
    } catch (err) {
      console.error(`[Firebase Adapter] Failed to fetch ${reference}`, err);
      if (isSubscribed) callback({ val: () => null, exists: () => false });
    }
  };

  fetchData();
  
  return () => {
    isSubscribed = false;
  };
}

export async function get(reference: string): Promise<any> {
  return new Promise((resolve) => {
    onValue(reference, (snapshot) => resolve(snapshot));
  });
}

export async function set(reference: string, data: any) {
  // Clear cache for this reference and its parent
  delete cache[reference];
  if (reference.startsWith('products/')) delete cache['products'];
  if (reference.startsWith('orders/')) delete cache['orders'];
  if (reference.startsWith('reviews/')) delete cache['reviews'];
  
  try {
    if (reference === 'products') {
      if (data === null) {
        return;
      }
      const res = await fetch(`${API_URL}/admin/products/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      // Also save extras
      const extras: Record<string, any> = {};
      Object.values(data).forEach((p: any) => {
        extras[p.id] = { 
          compareAtPrice: p.compareAtPrice, 
          variants: p.variants,
          shortDescription: p.shortDescription,
          faqs: p.faqs,
          howToUse: p.howToUse,
          quickFacts: p.quickFacts,
          keyBenefits: p.keyBenefits,
          ingredientBreakdown: p.ingredientBreakdown,
          whoItsFor: p.whoItsFor,
          structuredData: p.structuredData,
          slug: p.slug,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription
        };
      });
      await fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/product_extras.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extras)
      });
      return;
    }
    else if (reference.startsWith('products/')) {
      const id = reference.split('/')[1];
      if (data === null) {
        const res = await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      } else {
        const res = await fetch(`${API_URL}/admin/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP error! status: ${res.status} - ${text}`);
        }
        
        // Also save extras
        await fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/product_extras/${id}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            compareAtPrice: data.compareAtPrice, 
            variants: data.variants,
            shortDescription: data.shortDescription,
            faqs: data.faqs,
            howToUse: data.howToUse,
            quickFacts: data.quickFacts,
            keyBenefits: data.keyBenefits,
            ingredientBreakdown: data.ingredientBreakdown,
            whoItsFor: data.whoItsFor,
            structuredData: data.structuredData,
            slug: data.slug,
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription
          })
        });
      }
    }
    else if (reference.startsWith('orders/')) {
      const id = reference.split('/')[1];
      if (data === null) {
        const res = await fetch(`${API_URL}/admin/mock-orders/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      } else {
        const res = await fetch(`${API_URL}/admin/mock-orders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      }
    }
    else if (reference.startsWith('globals/')) {
      await fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/${reference}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    else if (reference.startsWith('reviews/')) {
      const parts = reference.split('/');
      const id = parts[1];
      if (data === null) {
        // Delete review
      } else if (parts[2] === 'status') {
        // Update review status
        await fetch(`${API_URL}/admin/reviews/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isApproved: data === 'approved' })
        });
      }
    }
    else if (reference.startsWith('pages_registry') || reference.startsWith('layouts/page-') || reference.startsWith('settings/')) {
      await fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/${reference}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    else if (reference.includes('layout') || reference.startsWith('global_elements') || reference.startsWith('ingredients') || reference.startsWith('discounts') || reference.startsWith('integrations')) {
      const res = await fetch(`${API_URL}/cms/layout/${reference}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    }
    else if (reference.startsWith('live_visits')) {
      // ignore
    }
  } catch (err) {
    console.error(`[Firebase Adapter] Failed to set ${reference}`, err);
    throw err;
  }
}

export async function remove(reference: any) {
  try {
    await set(reference, null);
  } catch (err) {
    console.error(`[Firebase Adapter] Failed to remove`, err);
  }
}
