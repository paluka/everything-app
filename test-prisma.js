require("dotenv").config({ path: ".env.local" });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully!");

    // Example query
    const users = await prisma.user.findMany();
    console.log("Users:", users);

    const user = await prisma.user.findUnique({
      where: {
        id: 1, // Replace with an actual ID or condition
      },
    });
    console.log(user);
  } catch (err) {
    console.error("Database connection error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
