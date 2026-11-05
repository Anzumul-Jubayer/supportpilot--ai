import { Router } from "express";
import {
  register,
  login,
  googleLoginController,
  getMe,
} from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLoginController);

router.get("/me", authenticate, getMe);

export default router;
