export interface Ingredient {
  id: string;
  name: string;
  type?: string;
  description: string;
  image: string;
  heroImage?: string;
  sku?: string;
  femaNumber?: string;
  casNumber?: string;
  category?: string;
  botanicalName?: string;
  plantParts?: string;
  extractionMethod?: string;
  history?: string;
  therapeuticProperties?: string;
  specifications?: any[];
  faqs?: any[];
  benefits: string[];
  historicalSignificance?: string;
  products?: any[];
}

export const INGREDIENT_DICTIONARY: Ingredient[] = [
  {
    id: 'jasmine',
    name: 'Jasmine',
    description: "This flower's sweet scent is known to help alleviate stress and anxiety, helping the body to unwind.",
    image: 'https://images.unsplash.com/photo-1596541604085-f55db67eb3f3?auto=format&fit=crop&q=80&w=300',
    benefits: ['Stress Relief', 'Aromatic', 'Soothing'],
    historicalSignificance: 'Revered in Ayurveda as the "King of Flowers", Jasmine has been used for centuries to calm the mind and nourish the spirit.'
  },
  {
    id: 'kewda',
    name: 'Kewda',
    description: 'The delicate Ketaki or Kewda flowers have anti oxidant and cooling properties.',
    image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=300',
    benefits: ['Cooling', 'Antioxidant', 'Skin Toning'],
    historicalSignificance: 'Traditionally distilled in copper vessels in Kannauj, Kewda water has been a staple in royal skincare routines.'
  },
  {
    id: 'marigold',
    name: 'Marigold (Calendula)',
    description: 'Marigold or Calendula has a high content of flavonoids, that act as anti-oxidants for the skin.',
    image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=300',
    benefits: ['Healing', 'Antioxidant', 'Brightening'],
    historicalSignificance: 'Used extensively in Indian weddings for its auspicious nature, Marigold is equally prized in ancient texts for its skin-healing virtues.'
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Rose, when applied to the skin, tones, diminishes fine lines, and deeply hydrates the skin.',
    image: 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?auto=format&fit=crop&q=80&w=300',
    benefits: ['Hydrating', 'Toning', 'Anti-aging'],
    historicalSignificance: 'The Desi Gulab (Indian Rose) was famously introduced to India by Mughal empress Noor Jahan, becoming a symbol of luxury and beauty.'
  },
  {
    id: 'saffron',
    name: 'Saffron (Kesar)',
    description: 'Saffron Stigma is known to reduce pigmentation and lighten the skin while also improving its complexion.',
    image: 'https://images.unsplash.com/photo-1601633513361-b844c82e6d64?auto=format&fit=crop&q=80&w=300',
    benefits: ['Radiance', 'Pigmentation Reduction', 'Complexion Enhancing'],
    historicalSignificance: 'The most expensive spice in the world, Kashmiri Saffron has always been a closely guarded beauty secret of queens.'
  },
  {
    id: 'sandalwood',
    name: 'Sandalwood (Chandan)',
    description: 'Sandalwood has antiseptic and soothing properties, known to calm inflamed skin and impart a lasting fragrance.',
    image: 'https://images.unsplash.com/photo-1621255551325-1e351b635ff4?auto=format&fit=crop&q=80&w=300',
    benefits: ['Antiseptic', 'Cooling', 'Fragrant'],
    historicalSignificance: 'Sacred in Hindu rituals, Sandalwood paste is applied to the forehead to cool the "Agni" (fire) element.'
  },
  {
    id: 'peppermint',
    name: 'Peppermint',
    description: 'Peppermint oil naturally cleanses the skin and has an antiseptic and antibacterial properties, imparting a cooling sensation.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=300',
    benefits: ['Cooling', 'Antibacterial', 'Refreshing'],
  },
  {
    id: 'almond',
    name: 'Sweet Almond',
    description: 'Rich in Vitamin E, sweet almond oil deeply nourishes the skin, locking in moisture and leaving a supple feel.',
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=300',
    benefits: ['Nourishing', 'Vitamin E Rich', 'Moisturizing'],
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Lavender oil is celebrated for its calming aroma and ability to soothe skin irritation.',
    image: 'https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?auto=format&fit=crop&q=80&w=300',
    benefits: ['Calming', 'Soothing', 'Healing'],
  }
];

export function parseProductIngredients(
  keyIngredientsStr: string | null | undefined,
  dictionary: Ingredient[] = INGREDIENT_DICTIONARY,
  productSku?: string,
  productName?: string
): Ingredient[] {
  const matchedIngredients: Ingredient[] = [];
  
  // Direct exact match check using products mapping
  const cleanSku = productSku ? productSku.toLowerCase().trim() : '';
  const cleanName = productName ? productName.toLowerCase().trim() : '';

  for (const ingredient of dictionary) {
    // 1. Direct map check from Excel mapping
    let isDirectMapped = false;
    if (Array.isArray((ingredient as any).products)) {
      isDirectMapped = (ingredient as any).products.some((prod: any) => {
        const prodSku = prod.sku ? prod.sku.toLowerCase().trim() : '';
        const prodName = prod.name ? prod.name.toLowerCase().trim() : '';
        
        const skuMatch = cleanSku && prodSku && (cleanSku === prodSku || cleanSku.includes(prodSku) || prodSku.includes(cleanSku));
        const nameMatch = cleanName && prodName && (cleanName === prodName || cleanName.includes(prodName) || prodName.includes(cleanName));
        return skuMatch || nameMatch;
      });
    }

    // 2. Fallback text match from keyIngredients string
    let isTextMapped = false;
    if (keyIngredientsStr) {
      const text = keyIngredientsStr.toLowerCase();
      isTextMapped = 
        text.includes(ingredient.id.toLowerCase()) || 
        text.includes(ingredient.name.toLowerCase()) ||
        ingredient.name.toLowerCase().split(' ').some(word => word.length > 3 && text.includes(word));
    }

    if (isDirectMapped || isTextMapped) {
      matchedIngredients.push(ingredient);
    }
  }

  // Fallback: if we didn't match anything, just return a couple of default ones so the UI doesn't look empty
  if (matchedIngredients.length === 0 && dictionary.length > 0) {
    return [
      dictionary.find(i => i.id === 'sandalwood' || i.id.includes('sandal')) || dictionary[0],
      dictionary.find(i => i.id === 'rose') || (dictionary[1] || dictionary[0])
    ].filter(Boolean);
  }

  return matchedIngredients;
}
