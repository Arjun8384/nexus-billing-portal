"use client";

import { useCallback, useEffect, useState } from "react";

import {
  downloadInvoicePdf,
  getInvoices,
  updateInvoiceStatus,
  type Invoice,
} from "@/lib/api";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInvoices = useCallback(async () => {
    try {
      setError("");

      const data = await getInvoices();

      setInvoices(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load invoices."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInvoices();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadInvoices]);

  async function handleStatusChange(
    invoiceId: string,
    status:
      | "ISSUED"
      | "PAID"
      | "CANCELLED"
  ) {
    try {
      setError("");

      await updateInvoiceStatus(
        invoiceId,
        status
      );

      await loadInvoices();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update invoice."
      );
    }
  }

  async function handleDownload(
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
          : "Unable to download invoice."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">
            Invoices
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage all billing records.
          </p>
        </header>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                All Invoices
              </h2>

              <p className="text-sm text-slate-500">
                {invoices.length} invoice
                {invoices.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadInvoices()
              }
              disabled={loading}
              className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No invoices found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">
                      Invoice
                    </th>
                    <th className="px-5 py-3 text-left font-semibold">
                      Issue Date
                    </th>
                    <th className="px-5 py-3 text-left font-semibold">
                      Due Date
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Total
                    </th>
                    <th className="px-5 py-3 text-left font-semibold">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {invoice.invoiceNumber}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(
                          invoice.issueDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(
                          invoice.dueDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right font-medium">
                        {invoice.currency}{" "}
                        {invoice.total.toFixed(2)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">
                          {invoice.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void handleDownload(
                                invoice.id
                              )
                            }
                            className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                          >
                            PDF
                          </button>

                          {invoice.status ===
                            "DRAFT" && (
                            <button
                              type="button"
                              onClick={() =>
                                void handleStatusChange(
                                  invoice.id,
                                  "ISSUED"
                                )
                              }
                              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                            >
                              Issue
                            </button>
                          )}

                          {invoice.status ===
                            "ISSUED" && (
                            <button
                              type="button"
                              onClick={() =>
                                void handleStatusChange(
                                  invoice.id,
                                  "CANCELLED"
                                )
                              }
                              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}