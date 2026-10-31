
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import { prisma } from "../../lib/prisma.js";
import type { RegisterInput } from "./auth.schema.js";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
);

// Generate JWT for both normal and Google login
function generateToken(user: {
  id: string;
  role: string;
}) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    secret,
    { expiresIn: "1d" },
  );
}

// Normal registration
export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: "CUSTOMER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

// Normal login
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (!user || !user.passwordHash) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    return null;
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

// Google login and registration
export async function googleLogin(idToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();

  if (
    !payload ||
    !payload.sub ||
    !payload.email ||
    payload.email_verified !== true
  ) {
    throw new Error("INVALID_GOOGLE_ACCOUNT");
  }

  const googleId = payload.sub;
  const email = payload.email.toLowerCase();
  const name = payload.name || email.split("@")[0];

  // Find an existing Google account
  let user = await prisma.user.findUnique({
    where: {
      googleId,
    },
  });

  if (!user) {
    // Check whether this email already belongs to an account
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      if (
        existingUser.googleId &&
        existingUser.googleId !== googleId
      ) {
        throw new Error("GOOGLE_ACCOUNT_ALREADY_LINKED");
      }

      // Link Google to the existing account
      user = await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          googleId,
        },
      });
    } else {
      // Create a new Google user
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
          role: "CUSTOMER",
        },
      });
    }
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
