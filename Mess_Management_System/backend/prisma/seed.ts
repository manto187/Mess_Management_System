import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding started...")

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@test.com",
      password: "123456"
    }
  })

  console.log("Seeding completed")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })