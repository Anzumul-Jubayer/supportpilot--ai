const tls = require("node:tls");

const host = "ep-summer-sea-b5fxckic.c-7.us-east-2.aws.neon.tech";

const socket = tls.connect(
  {
    host,
    port: 5432,
    servername: host,
    rejectUnauthorized: true,
    timeout: 10000,
  },
  () => {
    console.log("TLS connected");

    // PostgreSQL SSL connections normally begin with an SSLRequest
    // on a plain TCP socket. This test is TLS-first, so don't send
    // a PostgreSQL startup message until we confirm the endpoint's
    // expected protocol.
    console.log("TLS protocol:", socket.getProtocol());
  }
);

socket.setTimeout(10000);

socket.on("timeout", () => {
  console.log("Socket timed out waiting for a response");
  socket.destroy();
});

socket.on("error", (error) => {
  console.error("Socket error:", error.code || error.message);
});

socket.on("close", () => {
  console.log("Socket closed");
});