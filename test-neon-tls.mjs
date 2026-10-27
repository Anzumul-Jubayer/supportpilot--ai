import tls from "node:tls";

const host = "ep-summer-sea-b5fxckic-pooler.c-7.us-east-2.aws.neon.tech";

console.log("Testing TLS handshake with Neon...");

const socket = tls.connect({
  host,
  port: 5432,
  servername: host,
  rejectUnauthorized: true,
  family: 4,
  timeout: 15000,
});

socket.on("secureConnect", () => {
  console.log("TLS handshake: SUCCESS");
  console.log("Authorized:", socket.authorized);
  console.log("Protocol:", socket.getProtocol());
  socket.end();
});

socket.on("timeout", () => {
  console.error("TLS handshake: TIMEOUT");
  socket.destroy();
});

socket.on("error", (error) => {
  console.error("TLS error:", error.code, error.message);
});
