import { Router } from "express";
import {
  getAdminGroups,
  createGroup,
  getMyGroups,
  getGroupById,
  getGroupByName,
  leaveGroup,
  deleteGroup,
  searchGroups,
  addMembers,
  requestJoinGroup,
  getGroupJoinRequests,
  updateGroupJoinRequest,
} from "../controllers/group.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", createGroup);
router.get("/", getMyGroups);
router.get("/admin", getAdminGroups);
router.get("/search", searchGroups);
router.get("/name/:name", getGroupByName);
router.get("/:id", getGroupById);
router.post("/:id/members", addMembers);
router.post("/:id/join-request", requestJoinGroup);
router.delete("/:id/leave", leaveGroup);
router.delete("/:id", deleteGroup);

// Group join request management (admin)
router.get("/join-requests/all", getGroupJoinRequests);
router.patch("/join-requests/:requestId", updateGroupJoinRequest);

export default router;
