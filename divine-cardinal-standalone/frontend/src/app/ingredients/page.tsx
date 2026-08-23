'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { INGREDIENT_DICTIONARY } from '../../lib/ingredients';
import { optimizeCloudinaryUrl } from '../../lib/cloudinary';

export default function IngredientsIndex() {
  const [ingredients, setIngredients] = useState<any[]>(INGREDIENT_DICTIONARY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
    fetch(`${API_URL}/cms/layout/ingredients`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setIngredients(data);
        }
      })
      .catch(err => {
        console.error("Ingredients fetch failed, using fallback:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-serif text-luxury-charcoal font-light mb-6">Ingredients Glossary</h1>
        <div className="w-12 h-px bg-luxury-gold mx-auto mb-8" />
        <p className="text-sm font-sans text-luxury-charcoal/70 max-w-2xl mx-auto leading-relaxed">
          Discover the ancient Ayurvedic herbs and natural botanicals that power our formulations. Every ingredient is ethically sourced and chosen for its profound skin and wellness benefits.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-20 text-luxury-charcoal/60 font-sans text-sm">
            Loading ingredients...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex flex-col text-center group">
                <Link href={`/ingredients/${ingredient.id}`} className="block mb-6 relative overflow-hidden rounded-full w-48 h-48 mx-auto border border-luxury-gold/20 p-2 hover:border-luxury-gold transition-colors">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white shadow-sm">
                    <img 
                      src={optimizeCloudinaryUrl(ingredient.image, 300)} 
                      alt={ingredient.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </Link>
                <Link href={`/ingredients/${ingredient.id}`}>
                  <h4 className="font-serif text-xl text-luxury-charcoal mb-2 hover:text-luxury-gold transition-colors">{ingredient.name}</h4>
                </Link>
                <p className="text-xs text-luxury-charcoal/60 font-sans line-clamp-2 px-4">
                  {ingredient.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
