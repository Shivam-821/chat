import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getIndividualMessages,
  getGroupMessages,
  setSecureChat,
  verifySecureChat,
  removeSecureChat,
} from "../controllers/message.controller";

const messageRouter = Router();

// GET /api/v1/messages/individual/:user1Id/:user2Id?page=1
messageRouter.get(
  "/individual/:user1Id/:user2Id",
  authMiddleware,
  getIndividualMessages,
);

// GET /api/v1/messages/group/:groupId?page=1
messageRouter.get("/group/:groupId", authMiddleware, getGroupMessages);

// Api for secure chat
messageRouter.post("/secure-chat", authMiddleware, setSecureChat);
messageRouter.post("/verify-secure-chat", authMiddleware, verifySecureChat);
messageRouter.delete("/remove-secure-chat", authMiddleware, removeSecureChat);

export default messageRouter;
