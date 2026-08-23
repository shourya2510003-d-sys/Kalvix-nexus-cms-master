const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@divinecardinal.com';
  const plainPassword = 'admin';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User'
    },
    create: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User'
    }
  });

  console.log('Successfully created/updated Admin user:');
  console.log('Email:', adminUser.email);
  console.log('Password: admin');
}

main().catch(console.error).finally(() => prisma.$disconnect());
