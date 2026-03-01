import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getIndividualMessages,
  getGroupMessages,
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

export default messageRouter;
