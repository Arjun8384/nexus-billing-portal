"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .email("Invalid email address")
        .trim()
        .toLowerCase(),
    password: zod_1.z
        .string()
        .min(6, "Password must contain at least 6 characters"),
});
