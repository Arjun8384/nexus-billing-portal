"use client";

import type { Invoice } from "@/lib/api";

interface InvoiceDetailsProps {
  invoice: Invoice;
}

export default function InvoiceDetails({
  invoice,
}: InvoiceDetailsProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Info
            label="Status"
            value={invoice.status}
          />

          <Info
            label="Payment"
            value={invoice.paymentStatus}
          />

          <Info
            label="Issue Date"
            value={formatDate(invoice.issueDate)}
          />

          <Info
            label="Due Date"
            value={formatDate(invoice.dueDate)}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Invoice Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">
                  Description
                </th>

                <th className="px-6 py-3 text-right font-medium">
                  Quantity
                </th>

                <th className="px-6 py-3 text-right font-medium">
                  Unit Price
                </th>

                <th className="px-6 py-3 text-right font-medium">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {invoice.items.map((item, index) => (
                <tr key={`${item.description}-${index}`}>
                  <td className="px-6 py-4 text-slate-900">
                    {item.description}
                  </td>

                  <td className="px-6 py-4 text-right text-slate-600">
                    {item.quantity}
                  </td>

                  <td className="px-6 py-4 text-right text-slate-600">
                    {formatCurrency(
                      item.unitPrice,
                      invoice.currency
                    )}
                  </td>

                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    {formatCurrency(
                      item.amount,
                      invoice.currency
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex justify-end">
        <div className="w-full max-w-sm space-y-3 rounded-xl border bg-white p-6 shadow-sm">
          <SummaryRow
            label="Subtotal"
            value={formatCurrency(
              invoice.subtotal,
              invoice.currency
            )}
          />

          <SummaryRow
            label={`Tax (${invoice.taxRate}%)`}
            value={formatCurrency(
              invoice.taxAmount,
              invoice.currency
            )}
          />

          <div className="border-t pt-3">
            <SummaryRow
              label="Total"
              value={formatCurrency(
                invoice.total,
                invoice.currency
              )}
              strong
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 ${
        strong
          ? "text-base font-bold text-slate-900"
          : "text-sm text-slate-600"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function formatCurrency(
  amount: number,
  currency: string
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}