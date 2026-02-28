import { Server } from "socket.io";

export const initSocketListeners = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Each user joins a room named after their own userId so the server
    // can emit directly to them using io.to(userId).emit(...)
    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // on sending the message to individual
    socket.on("send-message", (data) => {
      socket.to(data.receiverId).emit("send-message", data);
    });

    // on sending the message to group
    socket.on("send-group-message", (data) => {
      socket.to(data.groupId).emit("send-group-message", data);
    });

    // on disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
