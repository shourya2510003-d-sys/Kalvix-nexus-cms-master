const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.product.updateMany({
    data: {
      status: 'ACTIVE'
    }
  })
  console.log(`Updated ${result.count} products to ACTIVE`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
