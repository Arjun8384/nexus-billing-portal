"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoiceSchema = exports.createInvoiceSchema = void 0;
const zod_1 = require("zod");
const objectIdSchema = zod_1.z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");
const invoiceItemSchema = zod_1.z.object({
    description: zod_1.z
        .string()
        .trim()
        .min(1, "Description is required")
        .max(500, "Description cannot exceed 500 characters"),
    quantity: zod_1.z
        .number()
        .int()
        .min(1, "Quantity must be at least 1"),
    unitPrice: zod_1.z
        .number()
        .min(0, "Unit price cannot be negative"),
});
exports.createInvoiceSchema = zod_1.z.object({
    clientId: objectIdSchema,
    issueDate: zod_1.z.coerce.date(),
    dueDate: zod_1.z.coerce.date(),
    items: zod_1.z
        .array(invoiceItemSchema)
        .min(1, "Invoice must contain at least one item"),
    taxRate: zod_1.z
        .number()
        .min(0)
        .max(100)
        .default(0),
    currency: zod_1.z
        .string()
        .trim()
        .length(3, "Currency must be a 3-letter code")
        .transform((value) => value.toUpperCase())
        .default("USD"),
});
exports.updateInvoiceSchema = zod_1.z
    .object({
    dueDate: zod_1.z.coerce.date().optional(),
    items: zod_1.z
        .array(invoiceItemSchema)
        .min(1, "Invoice must contain at least one item")
        .optional(),
    taxRate: zod_1.z
        .number()
        .min(0)
        .max(100)
        .optional(),
})
    .refine((data) => data.dueDate !== undefined ||
    data.items !== undefined ||
    data.taxRate !== undefined, {
    message: "At least one field must be provided",
});
