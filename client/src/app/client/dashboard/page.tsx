"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getInvoiceSummary,
  getInvoices,
  downloadInvoicePdf,
  type Invoice,
  type InvoiceSummary,
} from "@/lib/api";

import { InvoiceSummaryCards } from "@/components/client/InvoiceSummaryCards";
import InvoiceTable from "@/components/client/InvoiceTable";
import { createCheckoutSession } from "@/services/payment.service";

export default function ClientDashboardPage() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] =
    useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPayment, setLoadingPayment] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);

        const [invoiceData, summaryData] =
          await Promise.all([
            getInvoices(),
            getInvoiceSummary(),
          ]);

        if (cancelled) {
          return;
        }

        setInvoices(invoiceData);
        setSummary(summaryData);
      } catch (error) {
        if (cancelled) {
          return;
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard"
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDownload(invoice: Invoice) {
    try {
      const blob = await downloadInvoicePdf(
        invoice.id
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        `${invoice.invoiceNumber}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to download invoice"
      );
    }
  }

  async function handlePay(invoice: Invoice) {
    try {
      setLoadingPayment(invoice.id);

      const session =
        await createCheckoutSession(
          invoice.id
        );

      if (!session.checkoutUrl) {
        throw new Error(
          "Stripe checkout URL was not returned"
        );
      }

      window.location.href =
        session.checkoutUrl;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start payment"
      );

      setLoadingPayment(null);
    }
  }

  function handleView(invoice: Invoice) {
    router.push(
      `/client/invoices/${invoice.id}`
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-56 rounded bg-slate-200" />
            <div className="h-4 w-80 rounded bg-slate-200" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-28 rounded-lg bg-slate-200"
                  />
                )
              )}
            </div>

            <div className="h-96 rounded-lg bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Client Dashboard
          </h1>

          <p className="mt-1 text-muted-foreground">
            View your invoices and manage payments.
          </p>
        </div>

        {summary && (
          <InvoiceSummaryCards
            summary={summary}
          />
        )}

        <InvoiceTable
          invoices={invoices}
          loadingPayment={loadingPayment}
          onView={handleView}
          onDownload={handleDownload}
          onPay={handlePay}
        />
      </div>
    </main>
  );
}