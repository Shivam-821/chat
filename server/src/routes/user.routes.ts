import { Router } from "express";
import { addContactRequest } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Protect all user routes with auth middleware
router.use(authMiddleware);

router.post("/contact", addContactRequest);

export default router;
