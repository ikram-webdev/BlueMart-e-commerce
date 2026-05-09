import { Server } from "socket.io";
import { env } from "./env.js";

export function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join:user", (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });

  return io;
}
