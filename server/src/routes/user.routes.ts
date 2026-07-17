import { Router } from "express";
import {
  addContactRequest,
  getIncomingRequests,
  updateRequestStatus,
  getContacts,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.post("/add-contact", addContactRequest);
router.get("/requests", getIncomingRequests);
router.put("/requests/:requestId", updateRequestStatus);
router.get("/contacts", getContacts);

export default router;
