import tls from "node:tls";

const host = "ep-summer-sea-b5fxckic-pooler.c-7.us-east-2.aws.neon.tech";

const socket = tls.connect({
  host,
  port: 5432,
  servername: host,
  rejectUnauthorized: true,
  timeout: 10000,
});

socket.on("secureConnect", () => {
  console.log("TLS handshake succeeded:", socket.getProtocol());
  socket.end();
});

socket.on("timeout", () => {
  console.error("TLS handshake timed out");
  socket.destroy();
  process.exitCode = 1;
});

socket.on("error", (error) => {
  console.error("TLS test failed:", error.message);
  process.exitCode = 1;
});
