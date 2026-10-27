import "dotenv/config";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

console.log("pg version:", pg.version ?? "not exposed by this export");

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: true },
  sslnegotiation: "direct",
  connectionTimeoutMillis: 15000,
});

try {
  console.log("Testing PostgreSQL with direct TLS negotiation...");
  await client.connect();
  console.log("PostgreSQL connection established.");

  const result = await client.query("SELECT 1 AS test");
  console.log("Query result:", result.rows);
} catch (error) {
  console.error("PostgreSQL test failed:", error.code, error.message);
} finally {
  await client.end().catch(() => {});
}
