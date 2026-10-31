import { Router } from "express";
import {
  register,
  login,
  googleLoginController,
} from "./auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLoginController);

export default router;