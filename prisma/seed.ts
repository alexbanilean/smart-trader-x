import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing database...");

  // Clear existing data
  await prisma.user.deleteMany();

  await prisma.$executeRaw` TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;

  console.log("Seeding database...");

  // Create users

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@gmail.com",
      password: bcrypt.hashSync("admin", 10),
      role: "ADMIN",
    },
  });

  const client = await prisma.user.create({
    data: {
      name: "Client",
      email: "client@gmail.com",
      password: bcrypt.hashSync("client", 10),
      role: "CLIENT",
    },
  });

  console.log("Admin:", admin);
  console.log("Client:", client);

  console.log("Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
