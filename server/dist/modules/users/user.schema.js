"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientIdSchema = exports.updateClientStatusSchema = exports.updateClientSchema = exports.createClientSchema = void 0;
const zod_1 = require("zod");
exports.createClientSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),
    email: zod_1.z
        .string()
        .trim()
        .email("Invalid email address")
        .transform((value) => value.toLowerCase()),
    password: zod_1.z
        .string()
        .min(8, "Password must contain at least 8 characters")
        .max(100, "Password cannot exceed 100 characters"),
});
exports.updateClientSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2)
        .max(100)
        .optional(),
    email: zod_1.z
        .string()
        .trim()
        .email()
        .transform((value) => value.toLowerCase())
        .optional(),
    isActive: zod_1.z
        .boolean()
        .optional(),
});
exports.updateClientStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
exports.clientIdSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
});
