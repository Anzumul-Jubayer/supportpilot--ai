
import type { Request, Response } from "express";

import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
} from "./auth.schema.js";

import {
  registerUser,
  loginUser,
  googleLogin,
} from "./auth.service.js";

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid registration data",
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const user = await registerUser(parsed.data);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    console.error("Registration failed:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid login data",
    });
    return;
  }

  try {
    const result = await loginUser(parsed.data.email, parsed.data.password);

    if (!result) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Login failed:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function googleLoginController(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = googleLoginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid Google login data",
    });
    return;
  }

  try {
    const result = await googleLogin(parsed.data.idToken);

    res.status(200).json({
      success: true,
      message: "Google login successful",
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "INVALID_GOOGLE_ACCOUNT" ||
        error.message === "GOOGLE_ACCOUNT_ALREADY_LINKED")
    ) {
      res.status(401).json({
        success: false,
        message: "Google authentication failed",
      });
      return;
    }

    console.error("Google login failed:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
