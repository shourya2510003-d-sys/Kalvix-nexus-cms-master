const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.count();
  const pages = await prisma.cmsPage.count();
  console.log({ products, pages });
}
main().catch(console.error).finally(() => prisma.$disconnect());
