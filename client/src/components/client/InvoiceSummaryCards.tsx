"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InvoiceSummary } from "@/types/invoice";

interface InvoiceSummaryCardsProps {
  summary: InvoiceSummary;
}

const cards = [
  { key: "totalInvoices", label: "Total Invoices" },
  { key: "draft", label: "Draft" },
  { key: "issued", label: "Issued" },
  { key: "paid", label: "Paid" },
  { key: "overdue", label: "Overdue" },
  { key: "cancelled", label: "Cancelled" },
] as const;

export function InvoiceSummaryCards({
  summary,
}: InvoiceSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold">
              {summary[card.key]}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}