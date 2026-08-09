"use client";

import {
  Download,
  Eye,
  FileText,
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

interface InvoiceListProps {
  invoices: Invoice[];
  loading?: boolean;
  onView: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
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

export default function InvoiceList({
  invoices,
  loading = false,
  onView,
  onDownload,
}: InvoiceListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded-md bg-muted"
                />
              )
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-48 flex-col items-center justify-center text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground" />

          <h3 className="text-lg font-semibold">
            No invoices found
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Create an invoice to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Invoices ({invoices.length})
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-3 py-3 font-medium">
                  Invoice
                </th>
                <th className="px-3 py-3 font-medium">
                  Issue Date
                </th>
                <th className="px-3 py-3 font-medium">
                  Due Date
                </th>
                <th className="px-3 py-3 font-medium">
                  Total
                </th>
                <th className="px-3 py-3 font-medium">
                  Status
                </th>
                <th className="px-3 py-3 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b last:border-0"
                >
                  <td className="px-3 py-4 font-medium">
                    {invoice.invoiceNumber}
                  </td>

                  <td className="px-3 py-4">
                    {new Date(
                      invoice.issueDate
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-3 py-4">
                    {new Date(
                      invoice.dueDate
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-3 py-4 font-medium">
                    {new Intl.NumberFormat(
                      "en-US",
                      {
                        style: "currency",
                        currency:
                          invoice.currency,
                      }
                    ).format(invoice.total)}
                  </td>

                  <td className="px-3 py-4">
                    <Badge
                      variant={getStatusVariant(
                        invoice.status
                      )}
                    >
                      {invoice.status}
                    </Badge>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onView(invoice)
                        }
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onDownload(invoice)
                        }
                      >
                        <Download className="mr-1 h-4 w-4" />
                        PDF
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}