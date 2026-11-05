import { prisma } from "../../lib/prisma.js";
import type { z } from "zod";
import type {
  getUsersSchema,
  updateUserRoleSchema,
} from "./users.schema.js";
type GetUsersInput = z.infer<typeof getUsersSchema>;
type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export async function getAvailableAgents() {
  return prisma.user.findMany({
    where: {
      role: "AGENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getUsers(input: GetUsersInput) {
  const { page, limit, role } = input;

  const where = role ? { role } : {};

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateUserRole(
  userId: string,
  input: UpdateUserRoleInput,
) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!existingUser) throw new Error("USER_NOT_FOUND");
  if (existingUser.role === "ADMIN") {
    throw new Error("ADMIN_ROLE_PROTECTED");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role: input.role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });
}