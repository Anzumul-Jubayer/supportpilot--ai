import "dotenv/config";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const url = new URL(connectionString);
url.searchParams.delete("channel_binding");

const client = new pg.Client({
  connectionString: url.toString(),
  connectionTimeoutMillis: 10000,
  query_timeout: 10000,
});

try {
  console.log("Testing PostgreSQL without channel_binding...");
  await client.connect();
  console.log("Connected successfully.");

  const result = await client.query("SELECT 1 AS test");
  console.log("Query result:", result.rows);
} catch (error) {
  console.error("Connection test failed:", error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
