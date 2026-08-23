const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function optimizeProduct(product) {
  // 1. Format howToUse to bullet points
  let optimizedHowToUse = product.howToUse;
  if (optimizedHowToUse && !optimizedHowToUse.includes('<ul>')) {
    const sentences = optimizedHowToUse.split('.').map(s => s.trim()).filter(s => s.length > 0);
    if (sentences.length > 0) {
      optimizedHowToUse = `<ul>${sentences.map(s => `<li>${s}.</li>`).join('')}</ul>`;
    }
  } else if (!optimizedHowToUse) {
    optimizedHowToUse = `<ul><li>Gently apply a small amount as needed.</li><li>For best results, use consistently as part of your daily routine.</li></ul>`;
  }

  // 2. Generate SEO FAQs
  const productName = product.name;
  const faqs = [
    {
      question: `What are the key benefits of using ${productName}?`,
      answer: `Our ${productName} is specially formulated with authentic Ayurvedic ingredients to nourish, restore, and rejuvenate. Regular use helps target specific concerns while promoting overall wellbeing and vitality.`
    },
    {
      question: `How often should I use ${productName}?`,
      answer: `For optimal results, incorporate ${productName} into your daily routine. Please refer to the specific usage instructions above for the best outcomes tailored to this formulation.`
    },
    {
      question: `Are the ingredients in ${productName} safe and natural?`,
      answer: `Yes, ${productName} is crafted using pure, natural extracts following traditional Ayurvedic principles to ensure safety, efficacy, and high quality.`
    }
  ];

  // 3. SEO optimized description wrapper (injecting high-ranking keywords softly)
  let optimizedDesc = product.description;
  if (optimizedDesc && !optimizedDesc.includes('premium Ayurvedic')) {
    optimizedDesc = `${optimizedDesc}\n\n<p><strong>Why Choose ${productName}?</strong><br/>Experience the essence of holistic wellness with our premium Ayurvedic formulation, designed for modern lifestyles while staying true to ancient wisdom. Perfect for those seeking natural, effective, and organic solutions.</p>`;
  }

  return { optimizedHowToUse, faqs, optimizedDesc };
}

async function main() {
  console.log('Starting SEO & Content Optimization for all products...');
  
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products to optimize.`);

  for (const product of products) {
    const { optimizedHowToUse, faqs, optimizedDesc } = await optimizeProduct(product);

    // Update product content
    await prisma.product.update({
      where: { id: product.id },
      data: {
        howToUse: optimizedHowToUse,
        description: optimizedDesc
      }
    });

    // Handle FAQs: First delete existing to avoid duplicates if re-running
    await prisma.productFAQ.deleteMany({
      where: { productId: product.id }
    });

    // Insert new FAQs
    await prisma.productFAQ.createMany({
      data: faqs.map((f, i) => ({
        productId: product.id,
        question: f.question,
        answer: f.answer,
        order: i
      }))
    });

    console.log(`✅ Optimized: ${product.name}`);
  }

  console.log('🚀 All products successfully optimized for SEO, AEO, and formatted instructions!');
}

main()
  .catch(e => {
    console.error('Error during optimization:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
