import { Router } from "express";
import { createVideoCall } from "../controllers/video.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authMiddleware, createVideoCall);

export default router;