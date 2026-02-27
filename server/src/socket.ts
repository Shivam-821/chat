import { io } from "./config/socket.js";

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    

















    
  // disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});