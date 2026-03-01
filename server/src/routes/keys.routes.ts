import { Router } from "express";
import { backupKeys, getKeys } from "../controllers/keys.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.use(authMiddleware);

router.post("/backup", backupKeys);
router.get("/:userId", getKeys);

export default router;
