import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const email = 'munshi@mess.com';
  const password = 'munshi-password-123';
  
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: {
      email,
      name: 'منشی',
      password: hashedPassword,
      role: 'MUNSHI',
    },
  });

  console.log('--- Seed Data Created ---');
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${password}`);
  console.log('-------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
