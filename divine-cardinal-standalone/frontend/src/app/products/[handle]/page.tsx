import React from 'react';
import type { Metadata } from 'next';
import ProductClient from './ProductClient';
import HomeClient from '../../HomeClient';

export const dynamic = 'force-dynamic';

async function getProductData(handle: string) {
  try {
    const res = await fetch(`${'https://kalvix-nexus-production.up.railway.app/api'}/products/${handle}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const p = await res.json();
      try {
        const fbRes = await fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/product_extras/${p.id}.json`, { cache: 'no-store' });
        if (fbRes.ok) {
           const fbData = await fbRes.json();
           if (fbData) Object.assign(p, fbData);
        }
      } catch (e) {}
      return p;
    } else {
      // If direct fetch fails (e.g. 404), try fetching all products and finding by derived slug
      const allRes = await fetch(`${'https://kalvix-nexus-production.up.railway.app/api'}/products?limit=1000`, { cache: 'no-store' });
      if (allRes.ok) {
        const data = await allRes.json();
        const products = data.products || data.data || data;
        if (Array.isArray(products)) {
          let allExtras: any = {};
          try {
            const extRes = await fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/product_extras.json`, { cache: 'no-store' });
            if (extRes.ok) allExtras = await extRes.json();
          } catch(e) {}

          const match = products.find((p: any) => {
            const pSlug = allExtras[p.id]?.slug || p.slug;
            const derivedSlug = (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return derivedSlug === handle || p.id === handle || pSlug === handle || p.sku === handle;
          });
          if (match) {
            if (allExtras[match.id]) {
              Object.assign(match, allExtras[match.id]);
            }
            return match;
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Backend unreachable for product ${handle}. Using local details fallback.`);
    try {
      // Direct Firebase fallback using handle (which might be the ID or slug)
      const fbRes = await fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/product_extras/${handle}.json`, { cache: 'no-store' });
      if (fbRes.ok) {
        const p = await fbRes.json();
        if (p) return p;
      }
    } catch(e) {}
  }

  // Fallbacks for details
  const fallbackCatalog: Record<string, any> = {
    'chamomile-teething-roll-on': {
      id: 'prod-teething',
      name: 'Chamomile Teething Roll-On',
      slug: 'chamomile-teething-roll-on',
      description: 'A natural, plant-based external solution for soothing baby teething discomfort. Infused with organic Roman Chamomile and Sweet Almond oil, this gentle formulation is designed to be rolled along the baby\'s jawline externally to calm fussiness without oral ingestion.',
      summary: 'Soothing external roll-on for baby teething discomfort with Roman Chamomile & Almond Oil.',
      keyIngredients: 'Roman Chamomile Essential Oil, Sweet Almond Oil, Lavender Oil, Copaiba Oil.',
      howToUse: 'Gently roll along the jawline of the baby externally. Massage lightly with clean fingers. Do not apply inside the mouth or swallow.',
      rating: 4.8,
      basePrice: '599.00',
      categories: [{ slug: 'baby-and-mother-care', name: 'Baby & Mother Care' }],
      variants: [
        { id: 'var-teeth-10', title: '10ml', price: '599.00', sku: 'DC-BABY-TEETH-10ML', inventoryQuantity: 100 },
        { id: 'var-teeth-30', title: '30ml', price: '1399.00', sku: 'DC-BABY-TEETH-30ML', inventoryQuantity: 50 },
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600' },
      ],
      faqs: [
        { question: 'Is it safe for daily use?', answer: 'Yes, apply up to 3 times a day as needed.' },
        { question: 'Can it be applied to gums?', answer: 'No, this is purely an external application along the jawline.' },
      ],
      reviews: [],
    },
    'sea-buckthorn-face-serum': {
      id: 'prod-sbt',
      name: 'Sea Buckthorn Luxury Face Serum',
      slug: 'sea-buckthorn-face-serum',
      description: 'A luxurious blend of Sea Buckthorn fruit oil, Rosehip seed oil, and Jojoba. Packed with antioxidants, Vitamin C, and Omega-7, this face serum aids skin cell regeneration, reduces pigmentation, and delivers a radiant glow.',
      summary: 'An Ayurvedic anti-aging face serum packed with Vitamin C and Omega-7.',
      keyIngredients: 'Sea Buckthorn Oil, Rosehip Seed Oil, Jojoba Oil, Frankincense Essential Oil.',
      howToUse: 'Take 2-3 drops of serum on clean hands. Pat gently onto damp face and neck in upward strokes until absorbed.',
      rating: 4.9,
      basePrice: '1299.00',
      categories: [{ slug: 'face-and-body', name: 'Face & Body' }],
      variants: [{ id: 'var-sbt-30', title: '30ml', price: '1299.00', sku: 'DC-FACE-SBT-30ML', inventoryQuantity: 90 }],
      images: [
        { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600' },
      ],
      faqs: [],
      reviews: [],
    },
    'spasmodic-pain-relief-oil': {
      id: 'prod-pain',
      name: 'Spasmodic Pain Relief Massage Oil',
      slug: 'spasmodic-pain-relief-oil',
      description: 'Targeted pain relief massage oil for muscle spasms, cramps, and joint stiffness. Infused with warming Wintergreen, Peppermint, and Eucalyptus essential oils in a sesame oil base, this formula penetrates deep into tissues to alleviate discomfort.',
      summary: 'Deep muscle spasm and joint pain relief massage oil.',
      keyIngredients: 'Wintergreen Oil, Peppermint Essential Oil, Eucalyptus Oil, Sesame Base Oil.',
      howToUse: 'Apply generous amounts to the affected muscle or joint. Massage in circular motions until fully absorbed. Apply heat afterward for enhanced relief.',
      rating: 4.7,
      basePrice: '849.00',
      categories: [{ slug: 'wellness', name: 'Wellness' }],
      variants: [{ id: 'var-pain-100', title: '100ml', price: '849.00', sku: 'DC-WELL-SPAS-100ML', inventoryQuantity: 200 }],
      images: [
        { url: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=600' },
      ],
      faqs: [],
      reviews: [],
    },
    'hathras-rose-attar': {
      id: 'prod-attar',
      name: 'Hathras Rose Attar',
      slug: 'hathras-rose-attar',
      description: 'An exquisite, alcohol-free fragrance distilled using the traditional deg-bhapka method in Hathras, Uttar Pradesh. Recreates the royal essence of fresh damask roses. Long-lasting, hydrating, and calming for the nervous system.',
      summary: 'Traditional deg-bhapka distilled rose attar from Hathras, pure and alcohol-free.',
      keyIngredients: 'Pure Damask Rose extract, Sandalwood oil base.',
      howToUse: 'Apply a drop on your pulse points (wrists, behind ears, neck) using the glass applicator. Massage lightly.',
      rating: 5.0,
      basePrice: '1800.00',
      categories: [{ slug: 'fragrance-attars', name: 'Fragrance & Attars' }],
      variants: [{ id: 'var-rose-5', title: '5ml', price: '1800.00', sku: 'DC-FRAG-ROSE-5ML', inventoryQuantity: 50 }],
      images: [
        { url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600' },
      ],
      faqs: [],
      reviews: [],
    },
  };

  const product = fallbackCatalog[handle];
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const product = await getProductData(resolvedParams.handle);
    const title = product.seoTitle || `${product.name} – Divine Cardinal`;
    const description = product.seoDescription || product.summary || product.description?.slice(0, 160) || 'Premium Ayurvedic wellness oil by Divine Cardinal.';
    const image = product.images?.[0]?.url;

    return {
      title,
      description,
      alternates: { canonical: `/products/${resolvedParams.handle}` },
      openGraph: {
        title,
        description,
        url: `https://divinecardinal.com/products/${resolvedParams.handle}`,
        type: 'website',
        images: image ? [{ url: image, alt: product.name }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : [],
      },
    };
  } catch {
    return {
      title: 'Product – Divine Cardinal',
      description: 'Premium Ayurvedic wellness products by Divine Cardinal.',
    };
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProductData(resolvedParams.handle);

  // Generate Product JSON-LD Schemas
  const schemas: any[] = [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://divinecardinal.com';
  
  // 1. Product & Merchant Listings Schema
  const absoluteImageUrl = product.images?.[0]?.url?.startsWith('http') 
    ? product.images[0].url 
    : `${baseUrl}${product.images?.[0]?.url || '/placeholder.jpg'}`;

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const productSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: absoluteImageUrl,
    description: product.summary || product.shortDescription || product.description,
    sku: product.variants?.[0]?.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: 'Divine Cardinal'
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.basePrice,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      priceValidUntil: nextYear.toISOString().split('T')[0],
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'INR'
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN'
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'd'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'd'
          }
        }
      }
    }
  };

  // Only add authentic reviews to build real customer trust and avoid Google penalties
  if (product.rating && product.reviews && product.reviews.length > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews.length,
      bestRating: '5',
      worstRating: '1'
    };
    productSchema.review = product.reviews.map((r: any) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: '5'
      },
      author: {
        '@type': 'Person',
        name: r.author || 'Anonymous'
      },
      reviewBody: r.text || ''
    }));
  }
  schemas.push(productSchema);

  // 2. BreadcrumbList Schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${baseUrl}/shop` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${baseUrl}/products/${product.slug}` }
    ]
  });

  // 3. FAQPage Schema
  if (product.faqs && product.faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: product.faqs.map((faq: any) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    });
  }

  // 4. VideoObject Schema (Boosts SEO & CTR for sales)
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: `Discover ${product.name}`,
    description: product.summary || product.shortDescription || 'Experience the luxury of Divine Cardinal wellness products.',
    thumbnailUrl: absoluteImageUrl,
    uploadDate: new Date('2024-01-01').toISOString(),
    contentUrl: 'https://www.youtube.com/watch?v=placeholder', // Fallback brand video URL
    embedUrl: 'https://www.youtube.com/embed/placeholder',
    publisher: {
      '@type': 'Organization',
      name: 'Divine Cardinal',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    }
  });

  return (
    <main className="min-h-screen pb-16">
      {schemas.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ProductClient product={product} />
      
      {/* Product-Specific EBC (Enhanced Brand Content) */}
      <div className="mt-8">
        <HomeClient banners={[]} bestSellers={[]} pageId={`product-${product.slug}`} />
      </div>
    </main>
  );
}
