import { z } from "zod";

export const getUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  role: z.enum(["CUSTOMER", "AGENT", "ADMIN"]).optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["CUSTOMER", "AGENT"]),
});