import { getRedisClient } from "../config/redis";

export interface BufferedMessage {
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: "text" | "image" | "file" | "video" | "audio";
  read?: boolean;
  readBy?: string[];
  replyTo?: string;
  edited?: boolean;
  editedAt?: Date;
  deleted?: boolean;
  deletedAt?: Date;
}

export class RedisMessageService {
  static async bufferMessage(
    roomId: string,
    messageData: BufferedMessage,
  ): Promise<void> {
    try {
      const redis = getRedisClient();
      const key = `buffer:${roomId}`;

      // Serialize and push to list
      await redis.lPush(key, JSON.stringify(messageData));

      // Set expiry to prevent memory leaks (24 hours)
      await redis.expire(key, 86400);

      console.log(`[Redis] Buffered message for room ${roomId}`);
    } catch (error) {
      console.error(
        `[Redis] Error buffering message for room ${roomId}:`,
        error,
      );
      throw error;
    }
  }

  static async getBufferedMessages(roomId: string): Promise<BufferedMessage[]> {
    try {
      const redis = getRedisClient();
      const key = `buffer:${roomId}`;

      // Get all messages from the list
      const messages = await redis.lRange(key, 0, -1);

      // Parse and reverse for chronological order (LPUSH adds to left, so we reverse)
      return messages.map((m) => JSON.parse(m)).reverse();
    } catch (error) {
      console.error(
        `[Redis] Error getting buffered messages for room ${roomId}:`,
        error,
      );
      return []; // Return empty array on error to prevent crashes
    }
  }

  static async flushBuffer(roomId: string): Promise<BufferedMessage[]> {
    try {
      const redis = getRedisClient();
      const key = `buffer:${roomId}`;

      // Get all messages
      const messages = await redis.lRange(key, 0, -1);

      // Delete the buffer if it has messages
      if (messages.length > 0) {
        await redis.del(key);
        console.log(
          `[Redis] Flushed ${messages.length} messages for room ${roomId}`,
        );
      }

      // Parse and reverse for chronological order
      return messages.map((m) => JSON.parse(m)).reverse();
    } catch (error) {
      console.error(`[Redis] Error flushing buffer for room ${roomId}:`, error);
      return []; // Return empty array on error
    }
  }

  static async getBufferCount(roomId: string): Promise<number> {
    try {
      const redis = getRedisClient();
      const key = `buffer:${roomId}`;
      return await redis.lLen(key);
    } catch (error) {
      console.error(
        `[Redis] Error getting buffer count for room ${roomId}:`,
        error,
      );
      return 0;
    }
  }

  static async clearBuffer(roomId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      const key = `buffer:${roomId}`;
      await redis.del(key);
      console.log(`[Redis] Cleared buffer for room ${roomId}`);
    } catch (error) {
      console.error(`[Redis] Error clearing buffer for room ${roomId}:`, error);
    }
  }
}
