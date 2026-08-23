async function updateProduct() {
  const API_URL = "https://kalvix-nexus-production.up.railway.app/api";

  console.log("Fetching products...");
  const res = await fetch(`${API_URL}/admin/products`);
  const products = await res.json();
  
  let targetProduct = null;
  
  if (Array.isArray(products)) {
    targetProduct = products.find(p => p.sku === 'DCIC18');
  } else {
    for (const key in products) {
      if (products[key].sku === 'DCIC18') {
        targetProduct = products[key];
        targetProduct.id = key;
        break;
      }
    }
  }

  if (!targetProduct) {
    console.log("DCIC18 not found");
    return;
  }

  console.log("Found DCIC18, ID:", targetProduct.id);

  targetProduct.description = `
Unlock a luminous, even-toned complexion with the Divine Cardinal Saffron & Marigold Brightening Formula (SKU: DCIC18). This potent, 100% natural elixir combines the legendary skin-lightening power of premium Kashmiri Saffron with the antioxidant-rich healing properties of Calendula (Marigold).

Infused with nature’s finest botanicals, this formula actively reduces pigmentation, dark spots, and dullness, revealing your skin's natural radiance. Perfect for all skin types, it absorbs instantly without any greasy residue, offering deep hydration and a visible youthful glow. Incorporate this luxurious blend into your daily routine and experience the ultimate Ayurvedic secret to flawless, glowing skin.
  `.trim();
  
  targetProduct.ebcData = {
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
  
  targetProduct.seoMetadata = {
    title: "Saffron & Marigold Brightening Elixir | Divine Cardinal",
    description: "Buy the premium Saffron & Marigold Brightening Formula. Reduces pigmentation and dark spots for a radiant, glowing complexion. 100% Natural.",
    keywords: ["saffron face oil", "marigold brightening", "pigmentation reduction", "ayurvedic skin care", "glow serum", "DCIC18"]
  };

  const putRes = await fetch(`${API_URL}/admin/products/${targetProduct.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(targetProduct)
  });

  if (putRes.ok) {
    console.log("Successfully updated product via API!");
  } else {
    console.error("Failed to update:", putRes.status, await putRes.text());
  }
}

updateProduct();
