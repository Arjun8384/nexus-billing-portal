"use client";

import {
  ArrowLeft,
  Download,
} from "lucide-react";

import type { Invoice } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InvoiceDetailProps {
  invoice: Invoice;
  onBack: () => void;
  onDownload: () => void;
}

function getStatusVariant(
  status: Invoice["status"]
) {
  switch (status) {
    case "PAID":
      return "default";
    case "CANCELLED":
      return "destructive";
    case "ISSUED":
      return "secondary";
    default:
      return "outline";
  }
}

export default function InvoiceDetail({
  invoice,
  onBack,
  onDownload,
}: InvoiceDetailProps) {
  const currencyFormatter =
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency,
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to invoices
        </Button>

        <Button onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>
                {invoice.invoiceNumber}
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Invoice details
              </p>
            </div>

            <div className="flex gap-2">
              <Badge
                variant={getStatusVariant(
                  invoice.status
                )}
              >
                {invoice.status}
              </Badge>

              <Badge
                variant={
                  invoice.paymentStatus ===
                  "PAID"
                    ? "default"
                    : "outline"
                }
              >
                {invoice.paymentStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">
                Issue Date
              </p>

              <p className="font-medium">
                {new Date(
                  invoice.issueDate
                ).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Due Date
              </p>

              <p className="font-medium">
                {new Date(
                  invoice.dueDate
                ).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Client ID
              </p>

              <p className="break-all font-medium">
                {invoice.clientId}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">
              Items
            </h3>

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invoice.items.map(
                    (item, index) => (
                      <tr
                        key={`${item.description}-${index}`}
                        className="border-b last:border-0"
                      >
                        <td className="px-4 py-3">
                          {item.description}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {item.quantity}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {currencyFormatter.format(
                            item.unitPrice
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-medium">
                          {currencyFormatter.format(
                            item.amount
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ml-auto max-w-sm space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Subtotal
              </span>

              <span>
                {currencyFormatter.format(
                  invoice.subtotal
                )}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Tax ({invoice.taxRate}%)
              </span>

              <span>
                {currencyFormatter.format(
                  invoice.taxAmount
                )}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3 text-lg font-bold">
              <span>Total</span>

              <span>
                {currencyFormatter.format(
                  invoice.total
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}