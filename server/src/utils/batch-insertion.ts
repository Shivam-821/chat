import { UserModel } from "../models/user.model";
import { MessageModel } from "../models/message.model";
import { IndividualMessageModel } from "../models/individual.model";
import { GroupModel } from "../models/group.model";
import { getRedisClient } from "../config/redis";

import { RedisMessageService } from "../services/redisMessageService";

/**
 * Message Worker
 * Periodically flushes buffered messages from Redis to MongoDB
 * Implements bulk insertion pattern for optimal performance
 */
export class MessageWorker {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunning: boolean = false;

  /**
   * Start worker with configurable interval
   * @param intervalMs Flush interval in milliseconds (default: 30 seconds)
   */
  static start(intervalMs: number = 30000) {
    if (this.isRunning) {
      console.log("[MessageWorker] Already running");
      return;
    }

    console.log(`[MessageWorker] Starting with ${intervalMs}ms interval`);
    this.isRunning = true;

    // Run immediately on start
    this.flushAllBuffers();

    // Then run periodically
    this.intervalId = setInterval(async () => {
      await this.flushAllBuffers();
    }, intervalMs);
  }

  /**
   * Flush all Redis buffers to MongoDB
   * Scans for all buffer:* keys and processes them
   */
  static async flushAllBuffers() {
    if (!this.isRunning) {
      return;
    }

    try {
      const redis = getRedisClient();

      // Get all buffer keys
      const keys = await redis.keys("buffer:*");

      if (keys.length === 0) {
        console.log("[MessageWorker] No buffers to flush");
        return;
      }

      console.log(`[MessageWorker] Flushing ${keys.length} buffers`);

      // Process each buffer
      let totalFlushed = 0;
      for (const key of keys) {
        const roomId = key.replace("buffer:", "");
        const count = await this.flushRoomBuffer(roomId);
        totalFlushed += count;
      }

      console.log(`[MessageWorker] Flushed ${totalFlushed} total messages`);
    } catch (error) {
      console.error("[MessageWorker] Error flushing buffers:", error);
    }
  }

  /**
   * Flush buffer for a specific room
   * Uses atomic flush and bulk insert for efficiency
   * @returns Number of messages flushed
   */
  static async flushRoomBuffer(roomId: string): Promise<number> {
    try {
      // Atomic flush from Redis
      const messages = await RedisMessageService.flushBuffer(roomId);

      if (messages.length === 0) {
        return 0;
      }

      // Bulk insert to MongoDB (much faster than individual inserts)
      await MessageModel.insertMany(messages, { ordered: false });

      console.log(
        `[MessageWorker] Flushed ${messages.length} messages for room ${roomId}`,
      );

      return messages.length;
    } catch (error) {
      console.error(`[MessageWorker] Error flushing room ${roomId}:`, error);

      // TODO: Implement retry logic or dead letter queue
      // For now, we log the error and continue
      // In production, you might want to:
      // 1. Retry with exponential backoff
      // 2. Move failed messages to a dead letter queue
      // 3. Alert monitoring systems

      return 0;
    }
  }

  /**
   * Manually trigger a flush (useful for testing or graceful shutdown)
   */
  static async flushNow(): Promise<void> {
    console.log("[MessageWorker] Manual flush triggered");
    await this.flushAllBuffers();
  }

  /**
   * Stop the worker
   * Optionally flush remaining messages before stopping
   */
  static async stop(flushBeforeStop: boolean = true): Promise<void> {
    if (!this.isRunning) {
      console.log("[MessageWorker] Not running");
      return;
    }

    console.log("[MessageWorker] Stopping...");

    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Flush remaining messages if requested
    if (flushBeforeStop) {
      console.log("[MessageWorker] Flushing remaining messages...");
      await this.flushAllBuffers();
    }

    this.isRunning = false;
    console.log("[MessageWorker] Stopped");
  }

  /**
   * Get worker status
   */
  static getStatus(): { isRunning: boolean; interval: number | null } {
    return {
      isRunning: this.isRunning,
      interval: this.intervalId ? 30000 : null, // Default interval
    };
  }
}
