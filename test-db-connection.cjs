const { Client } = require("pg");
const { URL } = require("node:url");
require("dotenv").config();

const connectionUrl = new URL(process.env.DATABASE_URL_UNPOOLED);

// Remove URL SSL parameters so the explicit SSL config is used.
connectionUrl.searchParams.delete("sslmode");
connectionUrl.searchParams.delete("channel_binding");
connectionUrl.searchParams.delete("sslnegotiation");

const client = new Client({
  connectionString: connectionUrl.toString(),
  connectionTimeoutMillis: 15000,
  ssl: {
    rejectUnauthorized: true,
  },
  sslnegotiation: "direct",
});

async function main() {
  try {
    await client.connect();

    const result = await client.query("SELECT 1 AS test");
    console.log("PostgreSQL connection successful:", result.rows);
  } catch (error) {
    console.error("Connection failed:", error.message);
    console.error("Error code:", error.code);
  } finally {
    await client.end().catch(() => {});
  }
}

main();