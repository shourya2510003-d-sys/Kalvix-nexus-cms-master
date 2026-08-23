"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function fixSlugs() {
    const products = await prisma.product.findMany();
    let updatedCount = 0;
    for (const p of products) {
        if (p.slug === p.id || !p.slug || p.slug.match(/^[A-Z0-9-]{5,10}$/)) {
            const newSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            console.log(`Updating ${p.id}: ${p.slug} -> ${newSlug}`);
            await prisma.product.update({
                where: { id: p.id },
                data: { slug: newSlug }
            });
            updatedCount++;
        }
    }
    console.log(`Updated ${updatedCount} products.`);
}
fixSlugs().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=fix-slugs.js.map