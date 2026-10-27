import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from .env");
}

const adapter = new PrismaPg({
  connectionString,
  connectionTimeoutMillis: 5000,
  query_timeout: 5000,
});

const prisma = new PrismaClient({ adapter });

try {
  const result = await prisma.$queryRaw`SELECT 1`;
  console.log("Database connected successfully:", result);
} catch (error) {
  console.error("Database connection test failed:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
