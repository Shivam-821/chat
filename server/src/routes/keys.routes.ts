import { Router } from "express";
import { backupKeys, getKeys } from "../controllers/keys.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.post("/backup", backupKeys);
router.get("/:userId", getKeys);

export default router;
