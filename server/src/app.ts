import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { io } from "./config/socket";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.static("public"));
app.set("io", io);

app.get("/", (req, res) => {
  res.send("Chat Server is running...");
});

// Important routes
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import taskRouter from "./routes/task.routes";
import notificationRouter from "./routes/notification.routes";
import groupRouter from "./routes/group.routes";
import messageRouter from "./routes/message.routes";

import keysRouter from "./routes/keys.routes";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/groups", groupRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/keys", keysRouter);

export { app };
