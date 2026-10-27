import "dotenv/config";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const url = new URL(connectionString);
url.searchParams.delete("sslmode");
url.searchParams.delete("channel_binding");

const client = new pg.Client({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized: true },
  connectionTimeoutMillis: 15000,
  options: "-c statement_timeout=10000",
});

try {
  console.log("Connecting to Neon over IPv4 with TLS...");
  await client.connect();
  console.log("PostgreSQL connection established.");

  const result = await client.query("SELECT 1 AS test");
  console.log("Query result:", result.rows);
} catch (error) {
  console.error("PostgreSQL test failed:", error.code, error.message);
} finally {
  await client.end().catch(() => {});
}
