import { Server } from "socket.io";
import { httpServer } from "../index.js";
import { initSocketListeners } from "../socket.js";

export let io: Server;

export const connectSocket = () => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  initSocketListeners(io);
};
