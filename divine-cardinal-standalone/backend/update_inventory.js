require('dotenv').config({ path: '../frontend/.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Setting inventory of all product variants to 10...");
  const result = await prisma.productVariant.updateMany({
    data: {
      inventoryQuantity: 10
    }
  });
  console.log(`Successfully updated inventory for ${result.count} variants.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
