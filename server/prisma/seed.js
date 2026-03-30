const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  const org = await prisma.organisation.upsert({
    where: { domain: 'safevoice.inc' },
    update: {},
    create: { name: 'SafeVoice Inc', domain: 'safevoice.inc' }
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@safevoice.inc' },
    update: {},
    create: { email: 'admin@safevoice.inc', passwordHash, role: 'ADMIN', organisationId: org.id }
  });

  const ethics1 = await prisma.user.upsert({
    where: { email: 'ethics1@safevoice.inc' },
    update: {},
    create: { email: 'ethics1@safevoice.inc', passwordHash, role: 'ETHICS_MEMBER', organisationId: org.id }
  });

  const employee1 = await prisma.user.upsert({
    where: { email: 'employee1@safevoice.inc' },
    update: {},
    create: { email: 'employee1@safevoice.inc', passwordHash, role: 'EMPLOYEE', organisationId: org.id }
  });

  console.log('Seeding finished. Default password for all users is "password123"');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });
