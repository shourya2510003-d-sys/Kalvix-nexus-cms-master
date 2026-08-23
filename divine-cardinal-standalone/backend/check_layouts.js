const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const layouts = await prisma.cmsLayout.findMany()
  console.log(`Found ${layouts.length} layouts.`)
  for (const l of layouts) {
    console.log(`Page ID: ${l.pageId}`)
    console.log(`Config (first 200 chars):`, JSON.stringify(l.config).slice(0, 200))
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
