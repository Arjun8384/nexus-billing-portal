import {
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
} from "mongoose";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentStatus =
  | "UNPAID"
  | "PAID";

export interface Invoice {
  invoiceNumber: string;
  clientId: Types.ObjectId;

  issueDate: Date;
  dueDate: Date;

  items: InvoiceItem[];

  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;

  currency: string;

  status: InvoiceStatus;
  paymentStatus: PaymentStatus;

  paidAt: Date | null;
}

export interface InvoiceTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export type InvoiceDocument =
  HydratedDocument<Invoice> &
    InvoiceTimestamps;

const invoiceItemSchema =
  new Schema<InvoiceItem>(
    {
      description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,
      },

      unitPrice: {
        type: Number,
        required: true,
        min: 0,
      },

      amount: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    {
      _id: false,
    }
  );

const invoiceSchema =
  new Schema<Invoice>(
    {
      invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
      },

      clientId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      issueDate: {
        type: Date,
        required: true,
      },

      dueDate: {
        type: Date,
        required: true,
      },

      items: {
        type: [invoiceItemSchema],
        required: true,

        validate: {
          validator: (
            items: InvoiceItem[]
          ) => items.length > 0,

          message:
            "Invoice must contain at least one item",
        },
      },

      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },

      taxRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0,
      },

      taxAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      total: {
        type: Number,
        required: true,
        min: 0,
      },

      currency: {
        type: String,
        required: true,
        uppercase: true,
        default: "USD",
      },

      status: {
        type: String,
        enum: [
          "DRAFT",
          "ISSUED",
          "PAID",
          "OVERDUE",
          "CANCELLED",
        ],
        default: "DRAFT",
        index: true,
      },

      paymentStatus: {
        type: String,
        enum: ["UNPAID", "PAID"],
        default: "UNPAID",
        index: true,
      },

      paidAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

export const InvoiceModel: Model<Invoice> =
  model<Invoice>(
    "Invoice",
    invoiceSchema
  );