const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const email = process.argv[2];
if (!email) {
  console.log("Please provide an email address.");
  process.exit(1);
}
async function main() {
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  });
  console.log(`Successfully made ${user.email} an ADMIN.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
