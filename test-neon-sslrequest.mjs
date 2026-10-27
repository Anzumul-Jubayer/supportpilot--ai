import net from "node:net";

const host = "ep-summer-sea-b5fxckic-pooler.c-7.us-east-2.aws.neon.tech";
const socket = net.connect({ host, port: 5432, family: 4, timeout: 10000 });

socket.on("connect", () => {
  console.log("TCP connected; sending PostgreSQL SSLRequest");

  // PostgreSQL SSLRequest: length 8, request code 80877103
  const request = Buffer.alloc(8);
  request.writeInt32BE(8, 0);
  request.writeInt32BE(80877103, 4);
  socket.write(request);
});

socket.on("data", (data) => {
  console.log("Server response byte:", data.toString("utf8"));
  console.log("Expected S = SSL supported; N = SSL not supported");
  socket.destroy();
});

socket.on("timeout", () => {
  console.error("Timed out waiting for PostgreSQL SSL response");
  socket.destroy();
});

socket.on("error", (error) => {
  console.error("Socket error:", error.code, error.message);
});
