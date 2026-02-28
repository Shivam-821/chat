import { Router } from "express";
import {
  getAdminGroups,
  createGroup,
  getMyGroups,
  getGroupById,
  leaveGroup,
  deleteGroup,
  searchGroups,
} from "../controllers/group.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", createGroup);
router.get("/", getMyGroups);
router.get("/admin", getAdminGroups);
router.get("/search", searchGroups);
router.get("/:id", getGroupById);
router.delete("/:id/leave", leaveGroup);
router.delete("/:id", deleteGroup);

export default router;
