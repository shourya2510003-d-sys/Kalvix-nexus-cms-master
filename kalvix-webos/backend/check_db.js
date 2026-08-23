const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, status: true }
  })
  console.log(`Found ${products.length} products.`)
  if (products.length > 0) {
    console.log('Sample:', products[0])
    
    const activeProducts = products.filter(p => p.status === 'ACTIVE')
    console.log(`Active count: ${activeProducts.length}`)
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
