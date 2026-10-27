import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const u = new URL(connectionString);

console.log({
  protocol: u.protocol,
  hostname: u.hostname,
  database: u.pathname.slice(1),
  sslmode: u.searchParams.get("sslmode"),
  channel_binding: u.searchParams.get("channel_binding"),
  usesPooler: u.hostname.includes("-pooler"),
});
