export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentStatus =
  | "UNPAID"
  | "PAID";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceWithClient
  extends Invoice {
  client: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface InvoiceSummary {
  totalInvoices: number;
  draft: number;
  issued: number;
  paid: number;
  overdue: number;
  cancelled: number;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
}