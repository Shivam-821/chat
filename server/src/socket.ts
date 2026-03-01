import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { getRedisClient } from "./config/redis";
import { updateOnlineStatus } from "./controllers/user.controller";
import { GroupModel } from "./models/group.model";
import {
  saveIndividualMessage,
  saveGroupMessage,
} from "./controllers/message.controller";
import { MessageModel } from "./models/message.model";

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

    // TYPING INDICATOR (INDIVIDUAL)
    socket.on("typing", (data: { senderId: string; receiverId: string }) => {
      const roomId = [data.senderId, data.receiverId].sort().join("_");
      socket.to(roomId).emit("typing", {
        senderId: data.senderId,
      });
    });

    // TYPING INDICATOR (GROUP)
    socket.on(
      "group-typing",
      (data: { senderId: string; senderName: string; groupId: string }) => {
        socket.to(data.groupId).emit("group-typing", {
          senderId: data.senderId,
          senderName: data.senderName,
          groupId: data.groupId,
        });
      },
    );

    // PRIVATE MESSAGE
    socket.on(
      "send-message",
      async (data: {
        senderId: string;
        receiverId: string;
        message: string;
        senderName: string;
        tempId?: string;
      }) => {
        const roomId = [data.senderId, data.receiverId].sort().join("_");

        try {
          // Persist to DB (blocking for ID return)
          const savedMessage = await saveIndividualMessage(
            data.senderId,
            data.receiverId,
            data.message,
          );

          if (savedMessage) {
            const broadcastData = { ...data, _id: savedMessage._id };
            socket.to(roomId).emit("receive-message", broadcastData);
            io.to(data.receiverId).emit("receive-notification", broadcastData);

            // Inform sender of real ID
            if (data.tempId) {
              socket.emit("message-sent-success", {
                tempId: data.tempId,
                realId: savedMessage._id,
              });
            }
          }
        } catch (err) {
          console.error("[saveIndividualMessage]:", err);
        }
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
        tempId?: string;
      }) => {
        try {
          const savedMessage = await saveGroupMessage(
            data.senderId,
            data.groupId,
            data.message,
          );

          if (savedMessage) {
            const broadcastData = { ...data, _id: savedMessage._id.toString() };
            socket
              .to(data.groupId)
              .emit("receive-group-message", broadcastData);

            // Inform sender of real ID
            if (data.tempId) {
              socket.emit("message-sent-success", {
                tempId: data.tempId,
                realId: savedMessage._id.toString(),
              });
            }

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
                io.to(memberId).emit("receive-notification", broadcastData);
              }
            });
          }
        } catch (err) {
          console.error("[saveGroupMessage]:", err);
        }
      },
    );

    // EDIT MESSAGE
    socket.on(
      "edit-message",
      async (data: {
        messageId: string;
        newText: string;
        receiverId?: string;
        groupId?: string;
      }) => {
        try {
          const { messageId, newText, receiverId, groupId } = data;
          const msg = await MessageModel.findById(messageId);

          if (!msg || msg.sender.toString() !== (socket as any).userId) return; // Only sender can edit

          msg.message = newText;
          msg.edited = true;
          await msg.save();

          const payload = { messageId, newText, isGroup: !!groupId };

          if (groupId) {
            socket.to(groupId).emit("message-edited", payload);
            // Inform sender too for optimistic UI update confirmation
            socket.emit("message-edited", payload);
          } else if (receiverId) {
            const roomId = [(socket as any).userId, receiverId]
              .sort()
              .join("_");
            socket.to(roomId).emit("message-edited", payload);
            socket.emit("message-edited", payload);
          }
        } catch (err) {
          console.error("[edit-message error]:", err);
        }
      },
    );

    // DELETE MESSAGE
    socket.on(
      "delete-message",
      async (data: {
        messageId: string;
        receiverId?: string;
        groupId?: string;
      }) => {
        try {
          const { messageId, receiverId, groupId } = data;
          const msg = await MessageModel.findById(messageId);

          if (!msg || msg.sender.toString() !== (socket as any).userId) return; // Only sender can delete

          msg.deleted = true;
          msg.message = "This message was deleted"; // Overwrite encrypted text for safety
          await msg.save();

          const payload = { messageId, isGroup: !!groupId };

          if (groupId) {
            socket.to(groupId).emit("message-deleted", payload);
            socket.emit("message-deleted", payload);
          } else if (receiverId) {
            const roomId = [(socket as any).userId, receiverId]
              .sort()
              .join("_");
            socket.to(roomId).emit("message-deleted", payload);
            socket.emit("message-deleted", payload);
          }
        } catch (err) {
          console.error("[delete-message error]:", err);
        }
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
