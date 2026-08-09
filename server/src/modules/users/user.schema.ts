import { z } from "zod";

export const createClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(100, "Password cannot exceed 100 characters"),
});

export const updateClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase())
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const updateClientStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UpdateClientStatusInput =
  z.infer<typeof updateClientStatusSchema>;
  
export const clientIdSchema = z.object({
  id: z.string().min(1),
});

export type CreateClientInput =
  z.infer<typeof createClientSchema>;

export type UpdateClientInput =
  z.infer<typeof updateClientSchema>;