import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import { createSocketServer } from "./config/socket.js";

async function bootstrap() {
  await connectDatabase();

  const server = http.createServer(app);
  const io = createSocketServer(server);
  app.set("io", io);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`BlueMart MERN API running on http://127.0.0.1:${env.port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
