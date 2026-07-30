import { Server } from "socket.io";
import { httpServer } from "../index.js";
import { initSocketListeners } from "../socket.js";

export let io: Server;

export const connectSocket = () => {
  // Support multiple allowed origins (comma-separated in CLIENT_URL env var)
  // e.g. CLIENT_URL="https://my-app.vercel.app,http://localhost:3000"
  const rawOrigin = process.env.CLIENT_URL || "http://localhost:3000";
  const allowedOrigins = rawOrigin.split(",").map((o) => o.trim());

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. server-to-server, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Render's free tier proxy has a 55s idle timeout; keep connections alive
    pingTimeout: 60000,
    pingInterval: 25000,
    // Allow both transports so clients can choose; websocket is preferred
    transports: ["polling", "websocket"],
    // Required for cross-origin cookies / auth headers on Render
    allowEIO3: true,
  });

  initSocketListeners(io);
};
