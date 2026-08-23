require('dotenv').config({ path: '../frontend/.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const variants = await prisma.productVariant.findMany({
    where: {
      sku: {
        contains: 'DCIC'
      }
    },
    include: {
      product: {
        include: {
          images: true
        }
      }
    }
  });
  
  console.log(`Found ${variants.length} DCIFB variants.`);
  variants.forEach(v => {
    console.log(`SKU: ${v.sku} | Product Name: ${v.product.name} | Images count: ${v.product.images.length}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
