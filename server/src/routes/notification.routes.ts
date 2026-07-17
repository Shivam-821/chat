import { Router } from "express";
import {
  deleteNotification,
  sendAlertOfTaskPending,
  getAllNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getAllNotifications);
router.get("/unread", getUnreadNotificationsCount);
router.put("/:id/read", markNotificationAsRead);
router.delete("/:id", deleteNotification);
router.post("/task-alerts", sendAlertOfTaskPending);

export default router;
