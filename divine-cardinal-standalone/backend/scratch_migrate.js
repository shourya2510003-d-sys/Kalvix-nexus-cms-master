const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function migrate() {
  console.log('Fetching product_extras from Firebase...');
  const res = await fetch('https://divine-cardinal-default-rtdb.firebaseio.com/product_extras.json');
  const extras = await res.json();
  
  if (!extras) {
    console.log('No extras found.');
    return;
  }

  const products = await prisma.product.findMany();
  
  for (const product of products) {
    const extra = extras[product.id];
    if (extra) {
      console.log(`Updating product ${product.id} (${product.name})...`);
      
      const updateData = {};
      if (extra.summary) updateData.summary = extra.summary;
      if (extra.keyIngredients) updateData.keyIngredients = extra.keyIngredients;
      if (extra.howToUse) updateData.howToUse = extra.howToUse;
      if (extra.overview) updateData.overview = extra.overview;
      if (extra.focusKeyword) updateData.focusKeyword = extra.focusKeyword;
      if (extra.secondaryKeywords) updateData.secondaryKeywords = JSON.stringify(extra.secondaryKeywords);
      if (extra.seoTags) updateData.seoTags = extra.seoTags;
      if (extra.externalRefs) updateData.externalRefs = JSON.stringify(extra.externalRefs);
      if (extra.whoIsItFor) updateData.whoIsItFor = extra.whoIsItFor;
      if (extra.keyBenefitsText) updateData.keyBenefitsText = extra.keyBenefitsText;
      if (extra.imageAltText) updateData.imageAltText = extra.imageAltText;
      if (extra.internalLinksText) updateData.internalLinksText = JSON.stringify(extra.internalLinksText);
      
      if (Object.keys(updateData).length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: updateData
        });
      }
    }
  }
  console.log('Migration complete.');
}

migrate()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
