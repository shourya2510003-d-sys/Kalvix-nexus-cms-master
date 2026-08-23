import { DEFAULT_HOMEPAGE_LAYOUT } from '../../../lib/defaultLayout';

export const THEMES_LIBRARY = [
  {
    id: 'divine_classic',
    name: 'Divine Classic (Original)',
    description: 'The standard, highly optimized default structure for Kalvix Nexus.',
    thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400',
    layout: DEFAULT_HOMEPAGE_LAYOUT
  },
  {
    id: 'luxe_beauty',
    name: 'Luxe Beauty',
    description: 'A premium, dark-themed elegant structure with video heroes and deep brand storytelling.',
    thumbnail: 'https://images.unsplash.com/photo-1611077543940-1ce463b72382?auto=format&fit=crop&q=80&w=400',
    layout: [
      {
        id: "hero_banner",
        order: 0,
        visible: true,
        styles: { backgroundColor: "#1a1a1a", textColor: "#F3E5AB", fontFamily: "font-serif", textAlignment: "center" },
        data: {
          sliderInterval: 6,
          slides: [
            {
              id: "slide-1",
              mediaType: "image",
              mediaUrl: "https://images.unsplash.com/photo-1611077543940-1ce463b72382?auto=format&fit=crop&q=80&w=1200",
              subtitle: "The Ultimate Luxury",
              title: "LUXE SKINCARE COLLECTION",
              description: "Experience the pinnacle of botanical luxury. Handcrafted serums tailored for radiant beauty.",
              buttonText: "Shop Collection",
              buttonLink: "/shop"
            }
          ]
        }
      },
      {
        id: "best_sellers",
        order: 1,
        visible: true,
        data: {
          title: "SIGNATURE BLENDS",
          subtitle: "Curated for you",
          description: "Our most exclusive and highest-rated formulations.",
          productIds: []
        }
      },
      {
        id: "our_story",
        order: 2,
        visible: true,
        data: {
          image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1200",
          title: "The Luxe Promise",
          description: "A dedication to purity and luxury, blending rare herbs and oils to create products that treat your body like a temple.",
          signatureText: "Luxe Formulation Team"
        }
      },
      {
        id: "testimonials_slider",
        order: 3,
        visible: true,
        data: {
          buttonText: "Share Your Experience",
          items: [
            {
              name: "Elite Customer",
              image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
              text: "Absolutely mesmerizing experience. The textures and fragrances are completely out of this world.",
              rating: 5,
              timeAgo: "1 week ago"
            }
          ]
        }
      }
    ]
  },
  {
    id: 'zen_wellness',
    name: 'Zen Wellness',
    description: 'A clean, minimalist, and bright layout focused on holistic health and clear products.',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400',
    layout: [
      {
        id: "slow_beauty",
        order: 0,
        visible: true,
        data: {
          title: "MINDFUL WELLNESS",
          description: "Take a deep breath. Explore our gentle, natural remedies for peace of mind and body.",
          buttonText: "Discover Peace",
          buttonLink: "/shop",
          mediaType: "image",
          videoImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200",
          videoSubtitle: "A moment of calm",
          videoTitleLine1: "Embrace",
          videoTitleLine2: "True Balance"
        }
      },
      {
        id: "shop_by_concern",
        order: 1,
        visible: true,
        data: {
          title: "Find Your Balance",
          items: [
            { name: 'Stress Relief', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300' },
            { name: 'Deep Sleep', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=300' }
          ]
        }
      },
      {
        id: "quiz_banner",
        order: 2,
        visible: true,
        data: {
          image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=1200",
          subtitle: "Guided",
          title: "Wellness Journey",
          description: "Not sure where to start? Let us guide you to the perfect calming products.",
          buttonText: "Find My Ritual",
          questions: [],
          recommendations: []
        }
      },
      {
        id: "latest_reads",
        order: 3,
        visible: true,
        data: {
          title: "Mindfulness Journal",
          buttonText: "Read Journal >",
          buttonLink: "/blogs",
          items: [
            {
              title: 'THE ART OF STILLNESS',
              category: 'Mindfulness',
              image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600',
              date: 'July 15, 2026',
              content: 'Finding quiet in a noisy world is a necessity, not a luxury.'
            }
          ]
        }
      }
    ]
  }
];

export const ALL_THEME_SECTIONS = THEMES_LIBRARY.flatMap(theme => 
  theme.layout.map(section => ({
    ...section,
    id: `${theme.id}_${section.id}`,
    _originalId: section.id,
    _themeName: theme.name,
    _themeId: theme.id
  }))
);
