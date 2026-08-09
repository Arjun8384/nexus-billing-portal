import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB ObjectId"
  );

const invoiceItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(
      1,
      "Description is required"
    )
    .max(
      500,
      "Description cannot exceed 500 characters"
    ),

  quantity: z
    .number()
    .int()
    .min(
      1,
      "Quantity must be at least 1"
    ),

  unitPrice: z
    .number()
    .min(
      0,
      "Unit price cannot be negative"
    ),
});

export const createInvoiceSchema =
  z.object({
    clientId: objectIdSchema,

    issueDate: z.coerce.date(),

    dueDate: z.coerce.date(),

    items: z
      .array(invoiceItemSchema)
      .min(
        1,
        "Invoice must contain at least one item"
      ),

    taxRate: z
      .number()
      .min(0)
      .max(100)
      .default(0),

    currency: z
      .string()
      .trim()
      .length(
        3,
        "Currency must be a 3-letter code"
      )
      .transform((value) =>
        value.toUpperCase()
      )
      .default("USD"),
  });

export const updateInvoiceSchema =
  z
    .object({
      dueDate: z.coerce.date().optional(),

      items: z
        .array(invoiceItemSchema)
        .min(
          1,
          "Invoice must contain at least one item"
        )
        .optional(),

      taxRate: z
        .number()
        .min(0)
        .max(100)
        .optional(),
    })
    .refine(
      (data) =>
        data.dueDate !== undefined ||
        data.items !== undefined ||
        data.taxRate !== undefined,
      {
        message:
          "At least one field must be provided",
      }
    );

export type CreateInvoiceInput =
  z.infer<typeof createInvoiceSchema>;

export type UpdateInvoiceInput =
  z.infer<typeof updateInvoiceSchema>;