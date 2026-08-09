"use client";

import {
  Download,
  Eye,
  Loader2,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Invoice } from "@/lib/api";

interface InvoiceTableProps {
  invoices: Invoice[];
  loadingPayment: string | null;
  onView: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
  onPay: (invoice: Invoice) => void;
}

function statusVariant(
  status: Invoice["status"]
) {
  switch (status) {
    case "PAID":
      return "default";

    case "OVERDUE":
    case "CANCELLED":
      return "destructive";

    default:
      return "secondary";
  }
}

export default function InvoiceTable({
  invoices,
  loadingPayment,
  onView,
  onDownload,
  onPay,
}: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No invoices found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Invoices</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">
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
                  <td className="px-4 py-3 font-medium">
                    {invoice.invoiceNumber}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(
                      invoice.dueDate
                    ).toLocaleDateString("en-IN")}
                  </td>

                  <td className="px-4 py-3">
                    {invoice.currency}{" "}
                    {invoice.total.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      variant={statusVariant(
                        invoice.status
                      )}
                    >
                      {invoice.status}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="View invoice"
                        onClick={() =>
                          onView(invoice)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        title="Download PDF"
                        onClick={() =>
                          onDownload(invoice)
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      {invoice.status ===
                        "ISSUED" &&
                        invoice.paymentStatus ===
                          "UNPAID" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              onPay(invoice)
                            }
                            disabled={
                              loadingPayment ===
                              invoice.id
                            }
                          >
                            {loadingPayment ===
                            invoice.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CreditCard className="mr-2 h-4 w-4" />
                            )}
                            Pay
                          </Button>
                        )}
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