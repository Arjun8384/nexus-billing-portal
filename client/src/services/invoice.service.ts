import type {
  Invoice,
  InvoiceSummary,
  InvoiceWithClient,
} from "@/types/invoice";

import {
  getInvoice,
} from "@/lib/api";

import type { ApiResponse } from "@/types/api";

import { apiFetch } from "@/lib/api";

export async function getInvoices(): Promise<
  Invoice[]
> {
  const response =
    await apiFetch<
      ApiResponse<Invoice[]>
    >("/invoices");

  return response.data;
}

export async function getInvoiceById(
  invoiceId: string
): Promise<InvoiceWithClient> {
  const response =
    await apiFetch<
      ApiResponse<InvoiceWithClient>
    >(
      `/invoices/${invoiceId}`
    );

  return response.data;
}

export async function getInvoiceSummary(): Promise<InvoiceSummary> {
  const response =
    await apiFetch<
      ApiResponse<InvoiceSummary>
    >("/invoices/summary");

  return response.data;
}

export async function createInvoice(
  input: unknown
): Promise<Invoice> {
  const response =
    await apiFetch<
      ApiResponse<Invoice>
    >("/invoices", {
      method: "POST",
      body: JSON.stringify(input),
    });

  return response.data;
}

export async function updateInvoice(
  invoiceId: string,
  input: unknown
): Promise<Invoice> {
  const response =
    await apiFetch<
      ApiResponse<Invoice>
    >(
      `/invoices/${invoiceId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );

  return response.data;
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status:
    | "ISSUED"
    | "PAID"
    | "CANCELLED"
): Promise<Invoice> {
  const response =
    await apiFetch<
      ApiResponse<Invoice>
    >(
      `/invoices/${invoiceId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
        }),
      }
    );

  return response.data;
}

export async function getInvoiceDetails(
  invoiceId: string
): Promise<Invoice> {
  return getInvoice(invoiceId);
}