import { Router } from "express";
import {
  registerUser,
  loginUser,
  verifyToken,
  updateProfile,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify", authMiddleware, verifyToken);
router.patch(
  "/profile",
  authMiddleware,
  upload.single("avatar"),
  updateProfile,
);

export default router;
