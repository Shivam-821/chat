import { app } from "./app";
import http from "http";
import dotenv from "dotenv";
import connectDB from "./db/db";
import { connectToRedis } from "./config/redis";
import { connectSocket } from "./config/socket";

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
