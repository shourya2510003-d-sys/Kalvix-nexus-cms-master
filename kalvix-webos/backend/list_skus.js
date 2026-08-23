require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  const prefixes = new Set();
  products.forEach(p => {
    if (p.sku) {
      // get letters before first hyphen or number
      const match = p.sku.match(/^[A-Z]+/);
      if (match) {
        prefixes.add(match[0]);
      }
    }
  });
  console.log(Array.from(prefixes));
}

main().catch(console.error).finally(() => prisma.$disconnect());
