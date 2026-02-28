import { Router } from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Protect all task routes
router.use(authMiddleware);

router.route("/").get(getTasks).post(createTask);
router.route("/:id").put(updateTask).delete(deleteTask);

export default router;
