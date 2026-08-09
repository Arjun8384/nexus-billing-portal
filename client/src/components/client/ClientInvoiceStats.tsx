"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import type { InvoiceSummary } from "@/lib/api";

interface ClientInvoiceStatsProps {
  summary: InvoiceSummary;
}

export default function ClientInvoiceStats({
  summary,
}: ClientInvoiceStatsProps) {
  const stats = [
    {
      label: "Total Invoices",
      value: summary.totalInvoices,
    },
    {
      label: "Outstanding",
      value: `${summary.totalOutstanding.toFixed(2)}`,
    },
    {
      label: "Paid",
      value: `${summary.totalPaid.toFixed(2)}`,
    },
    {
      label: "Overdue",
      value: summary.overdue,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">
              {stat.label}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}