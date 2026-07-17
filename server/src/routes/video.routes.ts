import { Router } from "express";
import {
  createInstantVideoCall,
  joinVideoCall,
  endVideoCall,
  getCallHistory,
} from "../controllers/video.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", authMiddleware, createInstantVideoCall);
router.post("/join", authMiddleware, joinVideoCall);
router.post("/end", authMiddleware, endVideoCall);
router.get("/history", authMiddleware, getCallHistory);

export default router;
