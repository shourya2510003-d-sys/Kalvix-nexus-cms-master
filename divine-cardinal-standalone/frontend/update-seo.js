const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set } = require('firebase/database');

const firebaseConfig = {
  databaseURL: "https://kalvix-nexus-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function run() {
  const productsRef = ref(db, 'products');
  const snapshot = await get(productsRef);
  
  if (snapshot.exists()) {
    const products = snapshot.val();
    let productKey = null;
    let productData = null;

    if (Array.isArray(products)) {
      const idx = products.findIndex(p => p && p.sku === 'DCIC18');
      if (idx !== -1) {
        productKey = idx;
        productData = products[idx];
      }
    } else {
      for (const [key, val] of Object.entries(products)) {
        if (val.sku === 'DCIC18') {
          productKey = key;
          productData = val;
          break;
        }
      }
    }

    if (productKey !== null && productData) {
      console.log("Found Product:", productData.name, "Key:", productKey);
      
      // We will generate complete detailed description and EBC.
      productData.description = `
Unlock a luminous, even-toned complexion with the Divine Cardinal Saffron & Marigold Brightening Formula (SKU: DCIC18). This potent, 100% natural elixir combines the legendary skin-lightening power of premium Kashmiri Saffron with the antioxidant-rich healing properties of Calendula (Marigold).

Infused with nature’s finest botanicals, this formula actively reduces pigmentation, dark spots, and dullness, revealing your skin's natural radiance. Perfect for all skin types, it absorbs instantly without any greasy residue, offering deep hydration and a visible youthful glow. Incorporate this luxurious blend into your daily routine and experience the ultimate Ayurvedic secret to flawless, glowing skin.
      `.trim();
      
      productData.ebcData = {
        enabled: true,
        sections: [
          {
            type: "hero",
            title: "The Ultimate Elixir for Radiant Skin",
            content: "Experience the royal luxury of Kashmiri Saffron combined with the healing touch of Marigold. Say goodbye to pigmentation and hello to a flawless complexion.",
            imageUrl: "https://images.unsplash.com/photo-1601633513361-b844c82e6d64?auto=format&fit=crop&q=80&w=1200"
          },
          {
            type: "benefits",
            title: "Why Choose DCIC18?",
            features: [
              "Fades Pigmentation & Dark Spots",
              "Enhances Natural Glow",
              "Rich in Antioxidants & Vitamins",
              "100% Vegan & Cruelty-Free"
            ]
          },
          {
            type: "ingredients",
            title: "Powered by Nature",
            content: "Our formulation strictly uses ethically sourced, premium botanical extracts. Kashmiri Saffron lightens and brightens, while Calendula soothes and repairs environmental damage."
          }
        ]
      };
      
      productData.seoMetadata = {
        title: "Saffron & Marigold Brightening Elixir | Divine Cardinal",
        description: "Buy the premium Saffron & Marigold Brightening Formula. Reduces pigmentation and dark spots for a radiant, glowing complexion. 100% Natural.",
        keywords: ["saffron face oil", "marigold brightening", "pigmentation reduction", "ayurvedic skin care", "glow serum", "DCIC18"]
      };

      await set(ref(db, `products/${productKey}`), productData);
      console.log("Product updated successfully with SEO and EBC data.");
    } else {
      console.log("Product DCIC18 not found in database.");
    }
  } else {
    console.log("No products data found.");
  }
  process.exit(0);
}

run();
