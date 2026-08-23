const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'testadmin2@example.com' },
    update: { passwordHash: hash, role: 'ADMIN', twoFactorSecret: 'TOTP:JBSWY3DPEHPK3PXP' },
    create: {
      email: 'testadmin2@example.com',
      passwordHash: hash,
      role: 'ADMIN',
      firstName: 'Test',
      lastName: 'Admin',
      twoFactorSecret: 'TOTP:JBSWY3DPEHPK3PXP'
    }
  });
  console.log('Test admin created');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
