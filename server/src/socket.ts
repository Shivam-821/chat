import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { getRedisClient } from "./config/redis";
import { updateOnlineStatus } from "./controllers/user.controller";
import { GroupModel } from "./models/group.model";

// Cache group members
const groupCache = new Map<string, string[]>();

export const initSocketListeners = (io: Server) => {
  io.on("connection", async (socket) => {
    console.log(`Connected: ${socket.id}`);

    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        socket.disconnect();
        return;
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      const userId = decoded.id;

      (socket as any).userId = userId;

      // PERSONAL ROOM
      socket.join(userId);

      console.log(`${userId} joined personal room`);

      // ONLINE TRACKING (REDIS)
      const count = await getRedisClient().incr(`online:${userId}`);

      if (count === 1) {
        await updateOnlineStatus(userId, true);

        console.log(`${userId} is online`);
      }
    } catch (err) {
      console.log("Auth failed");

      socket.disconnect();

      return;
    }

    // PRIVATE ROOM
    socket.on("join-room", (data: { userId: string; receiverId: string }) => {
      const roomId = [data.userId, data.receiverId].sort().join("_");

      socket.join(roomId);

      console.log(`Joined ${roomId}`);
    });

    // GROUP ROOM
    socket.on("join-group-room", (data: { groupId: string }) => {
      socket.join(data.groupId);

      console.log(`Joined group ${data.groupId}`);
    });

    // PRIVATE MESSAGE
    socket.on(
      "send-message",
      (data: {
        senderId: string;
        receiverId: string;
        message: string;
        senderName: string;
      }) => {
        const roomId = [data.senderId, data.receiverId].sort().join("_");

        socket.to(roomId).emit("receive-message", data);

        io.to(data.receiverId).emit("receive-notification", data);
      },
    );

    // GROUP MESSAGE
    socket.on(
      "send-group-message",
      async (data: {
        senderId: string;
        groupId: string;
        groupName: string;
        message: string;
        senderName: string;
      }) => {
        socket.to(data.groupId).emit("receive-group-message", data);

        let members = groupCache.get(data.groupId);

        if (!members) {
          const group = await GroupModel.findById(data.groupId).select(
            "members",
          );

          if (!group) return;

          members = group.members.map((m: any) => m.toString());

          groupCache.set(data.groupId, members);
        }

        members.forEach((memberId) => {
          if (memberId !== data.senderId) {
            io.to(memberId).emit("receive-notification", {
              senderName: data.senderName,
              message: data.message,
              groupName: data.groupName,
            });
          }
        });
      },
    );

    // DISCONNECT
    socket.on("disconnect", async () => {
      console.log(`Disconnected: ${socket.id}`);

      const userId = (socket as any).userId;

      if (!userId) return;

      const redis = getRedisClient();
      const count = await redis.decr(`online:${userId}`);

      if (count <= 0) {
        await redis.del(`online:${userId}`);

        await updateOnlineStatus(userId, false);

        console.log(`${userId} offline`);
      }
    });
  });
};
