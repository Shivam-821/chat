import { app } from "./app.js";
import http from "http";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { connectToRedis } from "./config/redis.js";
import { connectSocket } from "./config/socket.js";

dotenv.config();

export const httpServer = http.createServer(app);

const PORT = process.env.PORT || 3002;

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    connectToRedis();
    connectSocket();
  })
  .catch((error) => {
    console.error(`Server failed to start: ${error}`);
  });
