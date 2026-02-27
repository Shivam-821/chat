import { createClient, type RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

export const connectToRedis = async () => {
  try {
    redisClient = createClient({
      password: process.env.REDIS_PASSWORD as string,
      socket: {
        host: process.env.REDIS_HOST as string,
        port: parseInt(process.env.REDIS_PORT as string, 10),
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.log(
              "Redis: Too many retries, stopping reconnection attempts",
            );
            return new Error("Too many retries");
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    await redisClient.connect();
    console.log("Connected to Redis successfully");
  } catch (error) {
    console.error(`Redis connection failed: ${error}`);
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call connectToRedis first.");
  }
  return redisClient;
};
