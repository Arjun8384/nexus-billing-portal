import type { Types } from "mongoose";

import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from "./invoice.schema";

import type {
  InvoiceStatus,
  PaymentStatus,
} from "./invoice.model";

export type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
};

export type {
  InvoiceStatus,
  PaymentStatus,
};

export type InvoiceItemInput =
  CreateInvoiceInput["items"][number];

export interface InvoiceItemCalculation {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceResponse {
  id: string;
  invoiceNumber: string;
  clientId: string;

  issueDate: Date;
  dueDate: Date;

  items: InvoiceItemCalculation[];

  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;

  currency: string;

  status: InvoiceStatus;
  paymentStatus: PaymentStatus;

  paidAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceClientInfo {
  id: string;
  name: string;
  email: string;
}

export interface InvoiceWithClient
  extends InvoiceResponse {
  client: InvoiceClientInfo | null;
}

export interface InvoiceTotals {
  subtotal: number;
  taxAmount: number;
  total: number;
}

export type InvoiceClientId =
  Types.ObjectId | string;