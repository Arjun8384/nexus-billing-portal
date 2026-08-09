"use client";

import type { Invoice } from "@/lib/api";

interface ClientInvoiceTableProps {
  invoices: Invoice[];
  loading: boolean;
  onDownloadPdf: (
    invoiceId: string
  ) => void;
  onPay: (
    invoiceId: string
  ) => void;
}

function statusClass(
  status: Invoice["status"]
) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";

    case "OVERDUE":
      return "bg-red-100 text-red-700";

    case "ISSUED":
      return "bg-blue-100 text-blue-700";

    case "CANCELLED":
      return "bg-slate-200 text-slate-600";

    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default function ClientInvoiceTable({
  invoices,
  loading,
  onDownloadPdf,
  onPay,
}: ClientInvoiceTableProps) {
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
          Your invoices will appear here once they are created.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">
                Invoice
              </th>

              <th className="px-5 py-3">
                Due Date
              </th>

              <th className="px-5 py-3">
                Total
              </th>

              <th className="px-5 py-3">
                Status
              </th>

              <th className="px-5 py-3 text-right">
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
                    invoice.dueDate
                  ).toLocaleDateString()}
                </td>

                <td className="px-5 py-4 font-medium text-slate-900">
                  {invoice.currency}{" "}
                  {invoice.total.toFixed(2)}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onDownloadPdf(
                          invoice.id
                        )
                      }
                      className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                    >
                      PDF
                    </button>

                    {invoice.status ===
                      "ISSUED" &&
                      invoice.paymentStatus ===
                        "UNPAID" && (
                        <button
                          type="button"
                          onClick={() =>
                            onPay(invoice.id)
                          }
                          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          Pay
                        </button>
                      )}
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