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
import { IndividualMessageModel } from "./models/individual.model";
import { PollModel } from "./models/poll.model";

// Cache group members
const groupCache = new Map<string, string[]>();

export const initSocketListeners = (io: Server) => {
  io.on("connection", async (socket) => {
    // console.log(`Connected: ${socket.id}`);

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

      // console.log(`${userId} joined personal room`);

      // ONLINE TRACKING (REDIS)
      const count = await getRedisClient().incr(`online:${userId}`);

      if (count === 1) {
        await updateOnlineStatus(userId, true);

        // console.log(`${userId} is online`);
      }
    } catch (err) {
      // console.log("Auth failed");

      socket.disconnect();

      return;
    }

    // PRIVATE ROOM
    socket.on("join-room", (data: { userId: string; receiverId: string }) => {
      const roomId = [data.userId, data.receiverId].sort().join("_");

      socket.join(roomId);

      // console.log(`Joined ${roomId}`);
    });

    // GROUP ROOM
    socket.on("join-group-room", (data: { groupId: string }) => {
      socket.join(data.groupId);

      // console.log(`Joined group ${data.groupId}`);
    });

    // TYPING INDICATOR (INDIVIDUAL)
    socket.on("typing", (data: { senderId: string; receiverId: string }) => {
      const roomId = [data.senderId, data.receiverId].sort().join("_");
      // Emit to the specific chat room (if they are in it)
      socket.to(roomId).emit("typing", {
        senderId: data.senderId,
      });
      // Emit to the receiver's personal room (for Sidebar global listening)
      socket.to(data.receiverId).emit("typing", {
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
        replyOn?: string;
      }) => {
        const roomId = [data.senderId, data.receiverId].sort().join("_");

        try {
          // Persist to DB (blocking for ID return)
          const savedMessage = await saveIndividualMessage(
            data.senderId,
            data.receiverId,
            data.message,
            data.replyOn,
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
        replyOn?: string;
      }) => {
        try {
          const savedMessage = await saveGroupMessage(
            data.senderId,
            data.groupId,
            data.message,
            data.replyOn,
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

          if (!msg || msg.sender.toString() !== (socket as any).userId) return;

          msg.deleted = true;
          msg.message = "This message was deleted";
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

    // REACT MESSAGE
    socket.on(
      "react-message",
      async (data: {
        messageId: string;
        receiverId?: string;
        groupId?: string;
        reaction: string;
      }) => {
        try {
          const { messageId, receiverId, groupId, reaction } = data;
          const allowedReactions = [
            "😀",
            "👍",
            "😂",
            "😍",
            "🤣",
            "👌",
            "👏",
            "😭",
            "😡",
            "❤️",
            "😉",
            "😮",
          ];

          if (!allowedReactions.includes(reaction)) return;

          const msg = await MessageModel.findById(messageId);
          const userId = (socket as any).userId;

          if (!msg || msg.sender.toString() === userId) return;

          // Use Mongoose atomic operations to avoid VersionError on highly concurrent reactions.
          let updatedMsg = await MessageModel.findOneAndUpdate(
            { _id: messageId, "reactions.user": userId },
            { $pull: { reactions: { user: userId } } },
            { new: true },
          );

          let finalReactionStr = reaction;

          // If they didn't already have THIS reaction, push it.
          // (If they did have THIS reaction, the pull above just toggles it off, so we don't push it back).
          const oldReactionPos = msg.reactions.findIndex(
            (r: any) => r.user.toString() === userId,
          );
          const togglingOff =
            oldReactionPos !== -1 &&
            msg.reactions[oldReactionPos]?.reaction === reaction;

          if (!togglingOff) {
            updatedMsg = await MessageModel.findOneAndUpdate(
              { _id: messageId },
              { $push: { reactions: { user: userId, reaction } } },
              { new: true },
            );
          } else {
            finalReactionStr = ""; // Toggled off
          }

          if (!updatedMsg) {
            updatedMsg = await MessageModel.findById(messageId);
          }

          if (!updatedMsg) return;

          const payload = {
            messageId,
            reactions: updatedMsg.reactions,
            isGroup: !!groupId,
          };

          if (groupId) {
            socket.to(groupId).emit("message-reacted", payload);
            socket.emit("message-reacted", payload);
          } else if (receiverId) {
            const roomId = [userId, receiverId].sort().join("_");
            socket.to(roomId).emit("message-reacted", payload);
            socket.emit("message-reacted", payload);
          }
        } catch (err) {
          console.error("[react-message error]:", err);
        }
      },
    );

    // PIN MESSAGE
    socket.on(
      "pin-message",
      async (data: {
        roomId: string;
        messageId: string;
        groupId?: string;
        pinnedPersonName?: string;
      }) => {
        try {
          const { roomId, messageId, groupId, pinnedPersonName } = data;
          const msg = await MessageModel.findById(messageId);
          if (!msg) return;
          if (groupId) {
            const group = await GroupModel.findById(groupId);
            if (!group) return;
            group.pinnedMessage = messageId as any;
            await group.save();
            socket
              .to(groupId)
              .emit("message-pinned", { messageId, pinnedPersonName });
            socket.emit("message-pinned", { messageId, pinnedPersonName });
          } else {
            // roomId is a composite "userId1_userId2" string (NOT a Mongo ObjectId).
            // Split it to get both user IDs and do a findOne with $or.
            const parts = roomId.split("_");
            const individual = await IndividualMessageModel.findOne({
              $or: [
                { user1: parts[0], user2: parts[1] },
                { user1: parts[1], user2: parts[0] },
              ],
            });
            if (!individual) return;
            individual.pinnedMessage = messageId as any;
            await individual.save();
            socket
              .to(roomId)
              .emit("message-pinned", { messageId, pinnedPersonName });
            socket.emit("message-pinned", { messageId, pinnedPersonName });
          }
        } catch (err) {
          console.error("[pin-message error]:", err);
        }
      },
    );

    // UNPIN MESSAGE
    socket.on(
      "unpin-message",
      async (data: { roomId: string; groupId?: string }) => {
        try {
          const { roomId, groupId } = data;
          if (groupId) {
            await GroupModel.findByIdAndUpdate(groupId, {
              $unset: { pinnedMessage: 1 },
            });
            socket.to(groupId).emit("message-unpinned");
            socket.emit("message-unpinned");
          } else {
            const parts = roomId.split("_");
            await IndividualMessageModel.findOneAndUpdate(
              {
                $or: [
                  { user1: parts[0], user2: parts[1] },
                  { user1: parts[1], user2: parts[0] },
                ],
              },
              { $unset: { pinnedMessage: 1 } },
            );
            socket.to(roomId).emit("message-unpinned");
            socket.emit("message-unpinned");
          }
        } catch (err) {
          console.error("[unpin-message error]:", err);
        }
      },
    );

    // --------- POLL SOCKET STARTS ----------

    // CREATE POLL
    socket.on(
      "send-poll",
      async (data: {
        groupId: string;
        senderId: string;
        senderName: string;
        senderAvatar?: string;
        question: string;
        options: string[];
        allowMultiple: boolean;
        tempId?: string;
      }) => {
        try {
          const poll = await PollModel.create({
            groupId: data.groupId,
            createdBy: data.senderId,
            question: data.question,
            allowMultiple: data.allowMultiple,
            options: data.options.map((text) => ({ text, votes: [] })),
          });

          // Persist as a Message so it survives page refresh
          const message = await MessageModel.create({
            sender: data.senderId,
            chatId: data.groupId,
            chatType: "Group",
            message: `📊 ${data.question}`,
            type: "poll",
            poll: poll._id,
          });

          await GroupModel.findByIdAndUpdate(data.groupId, {
            lastMessage: message._id,
          });

          const payload = {
            _id: message._id.toString(),
            tempId: data.tempId,
            senderId: data.senderId,
            senderName: data.senderName,
            senderAvatar: data.senderAvatar,
            groupId: data.groupId,
            createdAt: (message as any).createdAt,
            poll: {
              _id: poll._id.toString(),
              question: poll.question,
              allowMultiple: poll.allowMultiple,
              options: poll.options.map((o) => ({
                text: o.text,
                votes: o.votes.map((v) => v.toString()),
              })),
            },
          };

          // Broadcast to the whole group room (including sender)
          io.to(data.groupId).emit("receive-group-poll", payload);
        } catch (err) {
          console.error("[send-poll error]:", err);
        }
      },
    );

    // VOTE ON POLL
    socket.on(
      "vote-poll",
      async (data: {
        pollId: string;
        groupId: string;
        optionIndex: number;
      }) => {
        try {
          const userId = (socket as any).userId;
          const poll = await PollModel.findById(data.pollId);
          if (!poll) return;

          const option = poll.options[data.optionIndex];
          if (!option) return;

          const alreadyVoted = option.votes.some(
            (v) => v.toString() === userId,
          );

          if (poll.allowMultiple) {
            // Toggle: add or remove this option's vote
            if (alreadyVoted) {
              option.votes = option.votes.filter(
                (v) => v.toString() !== userId,
              ) as any;
            } else {
              option.votes.push(userId);
            }
          } else {
            // Single-vote: clear all other options first, then toggle this one
            poll.options.forEach((o, i) => {
              o.votes = o.votes.filter((v) => v.toString() !== userId) as any;
            });
            if (!alreadyVoted) {
              poll.options[data.optionIndex]?.votes.push(userId);
            }
          }

          await poll.save();

          const payload = {
            pollId: data.pollId,
            options: poll.options.map((o) => ({
              text: o.text,
              votes: o.votes.map((v) => v.toString()),
            })),
          };

          io.to(data.groupId).emit("poll-updated", payload);
        } catch (err) {
          console.error("[vote-poll error]:", err);
        }
      },
    );

    // --------- POLL SOCKET ENDS ----------

    // --------- VIDEO CALL SOCKET STARTS ----------

    // 1. Both users join the room
    socket.on(
      "join-video-call",
      (data: { roomId: string; role: "host" | "guest" }) => {
        socket.join(data.roomId);
        (socket as any).videoRoomId = data.roomId;
        (socket as any).videoRole = data.role;

        // When a guest joins, notify the host so they can start the WebRTC Offer
        if (data.role === "guest") {
          socket.to(data.roomId).emit("user-joined-video", { role: data.role });
        }
      },
    );

    // 2. Host sends offer
    socket.on("video-offer", (data: { roomId: string; offer: any }) => {
      // Send the offer to everyone else in the room (the guest)
      socket.to(data.roomId).emit("video-offer", { offer: data.offer });
    });

    // 3. Guest sends answer
    socket.on("video-answer", (data: { roomId: string; answer: any }) => {
      // Send the answer to everyone else in the room (the host)
      socket.to(data.roomId).emit("video-answer", { answer: data.answer });
    });

    // 4. Exchanging ICE candidates
    socket.on(
      "video-ice-candidate",
      (data: { roomId: string; candidate: any }) => {
        socket
          .to(data.roomId)
          .emit("video-ice-candidate", { candidate: data.candidate });
      },
    );

    // 5. Media Toggle States
    socket.on(
      "toggle-video",
      (data: { roomId: string; isVideoOff: boolean }) => {
        socket
          .to(data.roomId)
          .emit("toggle-video", { isVideoOff: data.isVideoOff });
      },
    );

    socket.on("toggle-mic", (data: { roomId: string; isMuted: boolean }) => {
      socket.to(data.roomId).emit("toggle-mic", { isMuted: data.isMuted });
    });

    // 6. Leaving Call
    socket.on(
      "leave-video-call",
      (data: { roomId: string; role: "host" | "guest" }) => {
        socket.leave(data.roomId);
        socket
          .to(data.roomId)
          .emit("user-left-video-call", { role: data.role });
      },
    );

    // --------- VIDEO CALL SOCKET ENDS ----------

    // DISCONNECT
    socket.on("disconnect", async () => {
      // Handle Video Call Disconnect Recovery
      const videoRoomId = (socket as any).videoRoomId;
      const videoRole = (socket as any).videoRole;
      if (videoRoomId && videoRole) {
        socket
          .to(videoRoomId)
          .emit("user-left-video-call", { role: videoRole });
      }

      const userId = (socket as any).userId;

      if (!userId) return;

      const redis = getRedisClient();
      const count = await redis.decr(`online:${userId}`);

      if (count <= 0) {
        await redis.del(`online:${userId}`);

        await updateOnlineStatus(userId, false);
      }
    });
  });
};
