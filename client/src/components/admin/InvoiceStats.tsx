"use client";

import type { InvoiceSummary } from "@/lib/api";

interface InvoiceStatsProps {
  summary: InvoiceSummary;
}

const stats = [
  {
    key: "totalInvoices",
    label: "Total Invoices",
  },
  {
    key: "draft",
    label: "Draft",
  },
  {
    key: "issued",
    label: "Issued",
  },
  {
    key: "paid",
    label: "Paid",
  },
  {
    key: "overdue",
    label: "Overdue",
  },
  {
    key: "cancelled",
    label: "Cancelled",
  },
] as const;

export default function InvoiceStats({
  summary,
}: InvoiceStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="rounded-xl border bg-white p-4 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">
            {stat.label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {summary[stat.key]}
          </p>
        </div>
      ))}

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500">
          Total Billed
        </p>

        <p className="mt-2 text-2xl font-bold text-slate-900">
          {summary.totalBilled.toLocaleString()}
        </p>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500">
          Outstanding
        </p>

        <p className="mt-2 text-2xl font-bold text-slate-900">
          {summary.totalOutstanding.toLocaleString()}
        </p>
      </div>
    </div>
  );
}