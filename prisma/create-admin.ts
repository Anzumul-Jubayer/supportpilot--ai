
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
  sslnegotiation: "direct",
});

const prisma = new PrismaClient({ adapter });

async function createAdmin() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be configured",
    );
  }

  if (Buffer.byteLength(password, "utf8") < 12) {
    throw new Error("Admin password must be at least 12 bytes long");
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Admin password must not exceed 72 bytes");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error(
      "This email already exists. The script will not promote an existing account.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("Admin account created successfully:");
  console.log(admin);
}

async function main() {
  try {
    await createAdmin();
  } catch (error) {
    console.error("Admin creation failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
