"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const layouts = await prisma.cmsLayout.findMany();
    for (const layout of layouts) {
        let config = layout.config;
        if (Array.isArray(config)) {
            let updated = false;
            for (const section of config) {
                if (section.id === 'slow_beauty' && section.data) {
                    section.data.mediaType = 'video';
                    section.data.videoImage = 'https://kalvix-nexus-production.up.railway.app/uploads/1783752704651-371936797.mp4';
                    updated = true;
                }
            }
            if (updated) {
                await prisma.cmsLayout.update({
                    where: { id: layout.id },
                    data: { config }
                });
                console.log(`Updated layout ${layout.pageId}`);
            }
        }
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=update_video.js.map