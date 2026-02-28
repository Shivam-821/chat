import { Router } from "express";
import {
  deleteNotification,
  sendAlertOfTaskPending,
} from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.delete("/:id", deleteNotification);
router.post("/task-alerts", sendAlertOfTaskPending);

export default router;
