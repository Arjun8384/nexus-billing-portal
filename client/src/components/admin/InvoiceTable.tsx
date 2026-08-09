"use client";

import type { Invoice } from "@/lib/api";

interface InvoiceTableProps {
  invoices: Invoice[];
  onStatusChange: (
    invoiceId: string,
    status: "ISSUED" | "PAID" | "CANCELLED"
  ) => void;
  onDownloadPdf: (invoiceId: string) => void;
  loading?: boolean;
}

function statusClass(status: Invoice["status"]) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";
    case "ISSUED":
      return "bg-blue-100 text-blue-700";
    case "OVERDUE":
      return "bg-red-100 text-red-700";
    case "CANCELLED":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default function InvoiceTable({
  invoices,
  onStatusChange,
  onDownloadPdf,
  loading = false,
}: InvoiceTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
        Loading invoices...
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <p className="font-medium text-slate-900">
          No invoices found
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Create your first invoice to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Invoice
              </th>

              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Client
              </th>

              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Issue Date
              </th>

              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Due Date
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600">
                Total
              </th>

              <th className="px-4 py-3 text-left font-semibold text-slate-600">
                Status
              </th>

              <th className="px-4 py-3 text-right font-semibold text-slate-600">
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
                <td className="px-4 py-4 font-medium text-slate-900">
                  {invoice.invoiceNumber}
                </td>

                <td className="px-4 py-4 text-slate-600">
                  <span
                    className="block max-w-[180px] truncate"
                    title={invoice.clientId}
                  >
                    {invoice.clientId}
                  </span>
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {new Date(
                    invoice.issueDate
                  ).toLocaleDateString()}
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {new Date(
                    invoice.dueDate
                  ).toLocaleDateString()}
                </td>

                <td className="px-4 py-4 text-right font-medium text-slate-900">
                  {invoice.currency}{" "}
                  {invoice.total.toLocaleString()}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    {invoice.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={() =>
                          onStatusChange(
                            invoice.id,
                            "ISSUED"
                          )
                        }
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Issue
                      </button>
                    )}

                    {invoice.status === "ISSUED" && (
                      <button
                        type="button"
                        onClick={() =>
                          onStatusChange(
                            invoice.id,
                            "PAID"
                          )
                        }
                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                      >
                        Mark Paid
                      </button>
                    )}

                    {(invoice.status === "DRAFT" ||
                      invoice.status === "ISSUED") && (
                      <button
                        type="button"
                        onClick={() =>
                          onStatusChange(
                            invoice.id,
                            "CANCELLED"
                          )
                        }
                        className="rounded-md bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onDownloadPdf(invoice.id)
                      }
                      className="rounded-md border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}