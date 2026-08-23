import { PrismaClient, Role, OrderStatus, PaymentMethod, PaymentStatus, CouponType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with Divine Cardinal products and collections...');

  // 1. Create System Settings
  const settings = [
    { key: 'STORE_NAME', value: 'Kalvix Nexus', description: 'Store name' },
    { key: 'SUPPORT_EMAIL', value: 'care@divinecardinal.com', description: 'Support email' },
    { key: 'CONTACT_PHONE', value: '+91-9876543210', description: 'Support contact number' },
    { key: 'FREE_SHIPPING_THRESHOLD', value: '999', description: 'Minimum order amount for free shipping' },
  ];
  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  // 2. Create Categories
  const babyCare = await prisma.category.upsert({
    where: { slug: 'baby-and-mother-care' },
    update: {},
    create: {
      name: 'Baby & Mother Care',
      slug: 'baby-and-mother-care',
      description: 'Chemical-free and pediatric-safe Ayurvedic products for babies and mothers.',
    },
  });

  const faceBody = await prisma.category.upsert({
    where: { slug: 'face-and-body' },
    update: {},
    create: {
      name: 'Face & Body',
      slug: 'face-and-body',
      description: 'Luxury serums and creams crafted with exotic essential oils.',
    },
  });

  const wellness = await prisma.category.upsert({
    where: { slug: 'wellness' },
    update: {},
    create: {
      name: 'Wellness & Massage Oils',
      slug: 'wellness',
      description: 'Therapeutic and pain relief massage oils using ancient Vedic formulas.',
    },
  });

  const fragrances = await prisma.category.upsert({
    where: { slug: 'fragrance-attars' },
    update: {},
    create: {
      name: 'Fragrance & Attars',
      slug: 'fragrance-attars',
      description: 'Original attars from Hathras, the heart of traditional rose distillation.',
    },
  });

  // 3. Create Collections
  const bestSellers = await prisma.collection.upsert({
    where: { slug: 'best-sellers' },
    update: {},
    create: {
      name: 'Best Sellers',
      slug: 'best-sellers',
      description: 'Our most loved and effective Ayurvedic self-care essentials.',
      isActive: true,
    },
  });

  const therapeuticOils = await prisma.collection.upsert({
    where: { slug: 'therapeutic-oils' },
    update: {},
    create: {
      name: 'Therapeutic Oils',
      slug: 'therapeutic-oils',
      description: 'Vedic wellness oils designed for body healing and stress relief.',
      isActive: true,
    },
  });

  // 4. Create Products
  // 4a. Teething Roll-On
  const teething = await prisma.product.upsert({
    where: { slug: 'chamomile-teething-roll-on' },
    update: {},
    create: {
      name: 'Chamomile Teething Roll-On',
      slug: 'chamomile-teething-roll-on',
      description: 'A natural, plant-based external solution for soothing baby teething discomfort. Infused with organic Roman Chamomile and Sweet Almond oil, this gentle formulation is designed to be rolled along the baby\'s jawline externally to calm fussiness without oral ingestion.',
      summary: 'Soothing external roll-on for baby teething discomfort with Roman Chamomile & Almond Oil.',
      keyIngredients: 'Roman Chamomile Essential Oil, Sweet Almond Oil, Lavender Oil, Copaiba Oil.',
      howToUse: 'Gently roll along the jawline of the baby externally. Massage lightly with clean fingers. Do not apply inside the mouth or swallow.',
      rating: 4.8,
      basePrice: 599.00,
      categories: { connect: { id: babyCare.id } },
      collections: { connect: [{ id: bestSellers.id }] },
      variants: {
        create: [
          {
            sku: 'DC-BABY-TEETH-10ML',
            title: '10ml',
            price: 599.00,
            compareAtPrice: 799.00,
            inventoryQuantity: 150,
            weight: 35,
          },
        ],
      },
      images: {
        create: [
          {
            url: 'https://images.cloudinary.com/placeholder-teething.jpg',
            altText: 'Chamomile Teething Roll-On 10ml Bottle',
            position: 1,
          },
        ],
      },
      faqs: {
        create: [
          {
            question: 'Can this teething roll-on be applied inside the mouth?',
            answer: 'No, this is strictly an external application. Apply it along the baby\'s jawline and massage gently.',
          },
          {
            question: 'Is it safe for infants under 6 months?',
            answer: 'Yes, it is formulated with highly diluted, baby-safe essential oils. However, we always recommend a patch test and consulting with your pediatrician first.',
          },
        ],
      },
    },
  });

  // 4b. Sea Buckthorn Face Serum
  const buckthorn = await prisma.product.upsert({
    where: { slug: 'sea-buckthorn-face-serum' },
    update: {},
    create: {
      name: 'Sea Buckthorn Luxury Face Serum',
      slug: 'sea-buckthorn-face-serum',
      description: 'A luxurious blend of Sea Buckthorn fruit oil, Rosehip seed oil, and Jojoba. Packed with antioxidants, Vitamin C, and Omega-7, this face serum aids skin cell regeneration, reduces pigmentation, and delivers a radiant glow.',
      summary: 'An Ayurvedic anti-aging face serum packed with Vitamin C and Omega-7.',
      keyIngredients: 'Sea Buckthorn Oil, Rosehip Seed Oil, Jojoba Oil, Frankincense Essential Oil.',
      howToUse: 'Take 2-3 drops of serum on clean hands. Pat gently onto damp face and neck in upward strokes until absorbed.',
      rating: 4.9,
      basePrice: 1299.00,
      categories: { connect: { id: faceBody.id } },
      collections: { connect: [{ id: bestSellers.id }] },
      variants: {
        create: [
          {
            sku: 'DC-FACE-SBT-30ML',
            title: '30ml',
            price: 1299.00,
            compareAtPrice: 1599.00,
            inventoryQuantity: 90,
            weight: 80,
          },
        ],
      },
      images: {
        create: [
          {
            url: 'https://images.cloudinary.com/placeholder-sbt.jpg',
            altText: 'Sea Buckthorn Luxury Face Serum Bottle',
            position: 1,
          },
        ],
      },
    },
  });

  // 4c. Spasmodic Pain Relief Oil
  const painOil = await prisma.product.upsert({
    where: { slug: 'spasmodic-pain-relief-oil' },
    update: {},
    create: {
      name: 'Spasmodic Pain Relief Massage Oil',
      slug: 'spasmodic-pain-relief-oil',
      description: 'Targeted pain relief massage oil for muscle spasms, cramps, and joint stiffness. Infused with warming Wintergreen, Peppermint, and Eucalyptus essential oils in a sesame oil base, this formula penetrates deep into tissues to alleviate discomfort.',
      summary: 'Deep muscle spasm and joint pain relief massage oil.',
      keyIngredients: 'Wintergreen Oil, Peppermint Essential Oil, Eucalyptus Oil, Sesame Base Oil.',
      howToUse: 'Apply generous amounts to the affected muscle or joint. Massage in circular motions until fully absorbed. Apply heat afterward for enhanced relief.',
      rating: 4.7,
      basePrice: 849.00,
      categories: { connect: { id: wellness.id } },
      collections: { connect: [{ id: therapeuticOils.id }] },
      variants: {
        create: [
          {
            sku: 'DC-WELL-SPAS-100ML',
            title: '100ml',
            price: 849.00,
            compareAtPrice: 999.00,
            inventoryQuantity: 200,
            weight: 180,
          },
        ],
      },
      images: {
        create: [
          {
            url: 'https://images.cloudinary.com/placeholder-pain-oil.jpg',
            altText: 'Spasmodic Pain Relief Oil 100ml Bottle',
            position: 1,
          },
        ],
      },
    },
  });

  // 4d. Hathras Rose Attar
  const roseAttar = await prisma.product.upsert({
    where: { slug: 'hathras-rose-attar' },
    update: {},
    create: {
      name: 'Hathras Rose Attar',
      slug: 'hathras-rose-attar',
      description: 'An exquisite, alcohol-free fragrance distilled using the traditional deg-bhapka method in Hathras, Uttar Pradesh. Recreates the royal essence of fresh damask roses. Long-lasting, hydrating, and calming for the nervous system.',
      summary: 'Traditional deg-bhapka distilled rose attar from Hathras, pure and alcohol-free.',
      keyIngredients: 'Pure Damask Rose extract, Sandalwood oil base.',
      howToUse: 'Apply a drop on your pulse points (wrists, behind ears, neck) using the glass applicator. Massage lightly.',
      rating: 5.0,
      basePrice: 1800.00,
      categories: { connect: { id: fragrances.id } },
      collections: { connect: [{ id: bestSellers.id }] },
      variants: {
        create: [
          {
            sku: 'DC-FRAG-ROSE-5ML',
            title: '5ml',
            price: 1800.00,
            compareAtPrice: 2200.00,
            inventoryQuantity: 50,
            weight: 20,
          },
        ],
      },
      images: {
        create: [
          {
            url: 'https://images.cloudinary.com/placeholder-rose-attar.jpg',
            altText: 'Hathras Rose Attar Luxury Decanter',
            position: 1,
          },
        ],
      },
    },
  });

  // 5. Create Coupons
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: CouponType.PERCENTAGE,
      value: 10,
      minOrderAmount: 499.00,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FESTIVE300' },
    update: {},
    create: {
      code: 'FESTIVE300',
      type: CouponType.FLAT,
      value: 300,
      minOrderAmount: 2499.00,
      isActive: true,
    },
  });

  // 6. Create Blog Posts
  await prisma.blogPost.upsert({
    where: { slug: 'ayurvedic-benefits-of-roman-chamomile-for-babies' },
    update: {},
    create: {
      title: 'Ayurvedic Benefits of Roman Chamomile for Babies',
      slug: 'ayurvedic-benefits-of-roman-chamomile-for-babies',
      summary: 'Explore why Roman Chamomile has been revered in traditional Vedic medicine for calming infants, reducing colic, and soothing teething discomfort.',
      content: '<p>Teething can be a stressful time for both infants and parents. In Ayurveda, this phase is seen as an escalation of Vata and Pitta doshas, leading to irritability, mild fevers, and tender gums. While modern gel creams are often loaded with chemical numbing agents, Roman Chamomile offers a traditional, holistic, and completely natural remedy.</p><p>Roman Chamomile (Babune ka Phool) is renowned for its anti-inflammatory, soothing, and anti-spasmodic properties. By blending it with sweet almond oil, we create a gentle topical oil that can be externally massaged onto the baby\'s jawline. This directly pacifies the aggravated Vata dosha, relaxes the facial muscles, and induces deep, restful sleep. Always opt for natural, pure formulations that protect your baby\'s sensitive skin and body.</p>',
      author: 'Aarav Sharma, Ayurvedic Practitioner',
      tags: ['Baby Care', 'Ayurveda', 'Teething', 'Natural Oils'],
      isPublished: true,
    },
  });

  // 7. Create Banners
  await prisma.banner.upsert({
    where: { id: 'banner-hero-1' },
    update: {},
    create: {
      id: 'banner-hero-1',
      title: 'Vedic Wisdom Meets Modern Luxury',
      subtitle: 'Pure, organic, and highly-efficacious Ayurvedic formulations crafted for contemporary wellness.',
      image: 'https://images.cloudinary.com/placeholder-hero-banner.jpg',
      link: '/shop',
      position: 'HERO_1',
      isActive: true,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
