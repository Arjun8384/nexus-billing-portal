"use client";

import { useCallback, useEffect, useState } from "react";

import {
  downloadInvoicePdf,
  getInvoiceSummary,
  getInvoices,
  updateInvoiceStatus,
  type Invoice,
  type InvoiceSummary,
} from "@/lib/api";

import InvoiceStats from "@/components/admin/InvoiceStats";
import InvoiceTable from "@/components/admin/InvoiceTable";
import CreateInvoiceDialog from "@/components/admin/CreateInvoiceDialog";

const emptySummary: InvoiceSummary = {
  totalInvoices: 0,
  draft: 0,
  issued: 0,
  paid: 0,
  overdue: 0,
  cancelled: 0,
  totalBilled: 0,
  totalPaid: 0,
  totalOutstanding: 0,
};

export default function AdminDashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] =
    useState<InvoiceSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const [invoiceData, summaryData] =
        await Promise.all([
          getInvoices(),
          getInvoiceSummary(),
        ]);

      setInvoices(invoiceData);
      setSummary(summaryData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadDashboard]);

  async function handleStatusChange(
    invoiceId: string,
    status:
      | "ISSUED"
      | "PAID"
      | "CANCELLED"
  ) {
    try {
      setError("");
      setLoading(true);

      await updateInvoiceStatus(
        invoiceId,
        status
      );

      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update invoice status."
      );

      setLoading(false);
    }
  }

  async function handleDownloadPdf(
    invoiceId: string
  ) {
    try {
      setError("");

      const blob =
        await downloadInvoicePdf(invoiceId);

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download = "invoice.pdf";

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to download invoice PDF."
      );
    }
  }

  function handleCreated(invoice: Invoice) {
    setInvoices((current) => [
      invoice,
      ...current,
    ]);

    setDialogOpen(false);

    void loadDashboard();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Invoice Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage Nexus invoices and payments.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setDialogOpen(true)
            }
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Create Invoice
          </button>
        </header>

        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-medium"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <InvoiceStats summary={summary} />

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                All Invoices
              </h2>

              <p className="text-sm text-slate-500">
                View and manage billing records.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadDashboard()
              }
              disabled={loading}
              className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          <InvoiceTable
            invoices={invoices}
            loading={loading}
            onStatusChange={
              handleStatusChange
            }
            onDownloadPdf={
              handleDownloadPdf
            }
          />
        </section>
      </div>

      <CreateInvoiceDialog
        open={dialogOpen}
        onClose={() =>
          setDialogOpen(false)
        }
        onCreated={handleCreated}
      />
    </main>
  );
}