import "dotenv/config";
import pg from "pg";

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from .env");
}

const client = new Client({
  connectionString,
  connectionTimeoutMillis: 10000,
  query_timeout: 10000,
});

try {
  console.log("Connecting directly to PostgreSQL...");
  await client.connect();
  console.log("PostgreSQL connection established.");

  const result = await client.query("SELECT 1 AS test");
  console.log("Query result:", result.rows);
} catch (error) {
  console.error("PostgreSQL test failed:", error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
