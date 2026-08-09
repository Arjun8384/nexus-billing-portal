const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

interface ApiOptions
  extends RequestInit {
  body?: BodyInit | null;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong"
    );
  }

  return data;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  const result =
    (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Something went wrong"
    );
  }

  return result.data;
}

export async function getInvoices() {
  return apiRequest<
    Invoice[]
  >("/api/invoices");
}

export async function getInvoiceSummary() {
  return apiRequest<
    InvoiceSummary
  >("/api/invoices/summary");
}

export async function createInvoice(
  data: CreateInvoiceInput
) {
  return apiRequest<Invoice>(
    "/api/invoices",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status:
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
) {
  return apiRequest<Invoice>(
    `/api/invoices/${invoiceId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    }
  );
}

export async function getInvoice(
  invoiceId: string
) {
  return apiRequest<Invoice>(
    `/api/invoices/${invoiceId}`
  );
}

export async function downloadInvoicePdf(
  invoiceId: string
) {
  const response = await fetch(
    `${API_URL}/api/invoices/${invoiceId}/pdf`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to download invoice PDF"
    );
  }

  return response.blob();
}

export async function createCheckoutSession(
  invoiceId: string
) {
  return apiRequest<{
    sessionId: string;
    checkoutUrl: string | null;
  }>(
    "/api/payments/create-checkout-session",
    {
      method: "POST",
      body: JSON.stringify({
        invoiceId,
      }),
    }
  );
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
  status:
    | "DRAFT"
    | "ISSUED"
    | "PAID"
    | "OVERDUE"
    | "CANCELLED";
  paymentStatus:
    | "UNPAID"
    | "PAID";
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
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

export interface CreateInvoiceInput {
  clientId: string;
  issueDate: string;
  dueDate: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  taxRate: number;
  currency: string;
}

export { API_URL };