import { Router } from "express";
import { addContactRequest } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.use(authMiddleware);


router.post("/add-contact", addContactRequest);

export default router;
