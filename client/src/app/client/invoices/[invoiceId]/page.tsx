"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  Download,
} from "lucide-react";
import { toast } from "sonner";

import {
  downloadInvoicePdf,
  type Invoice,
} from "@/lib/api";
import { getInvoiceDetails } from "@/services/invoice.service";
import { createCheckoutSession } from "@/services/payment.service";
import InvoiceDetails from "@/components/client/InvoiceDetails";

interface Props {
  params: Promise<{
    invoiceId: string;
  }>;
}

export default function InvoiceDetailsPage({
  params,
}: Props) {
  const [invoice, setInvoice] =
    useState<Invoice | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [downloading, setDownloading] =
    useState(false);

  const [paying, setPaying] =
    useState(false);

  useEffect(() => {
    let active = true;

    async function loadInvoice() {
      try {
        const { invoiceId } = await params;

        const data =
          await getInvoiceDetails(invoiceId);

        if (active) {
          setInvoice(data);
        }
      } catch (error) {
        if (active) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load invoice"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInvoice();

    return () => {
      active = false;
    };
  }, [params]);

  async function handleDownload() {
    if (!invoice) {
      return;
    }

    try {
      setDownloading(true);

      const blob =
        await downloadInvoicePdf(invoice.id);

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
    } finally {
      setDownloading(false);
    }
  }

  async function handlePay() {
    if (!invoice) {
      return;
    }

    try {
      setPaying(true);

      const session =
        await createCheckoutSession(
          invoice.id
        );

      if (!session.checkoutUrl) {
        throw new Error(
          "Stripe checkout URL was not returned"
        );
      }

      window.location.assign(
        session.checkoutUrl
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start payment"
      );

      setPaying(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-5 w-40 rounded bg-slate-200" />

          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-8 w-56 rounded bg-slate-200" />
              <div className="h-4 w-72 rounded bg-slate-200" />
            </div>

            <div className="flex gap-2">
              <div className="h-10 w-32 rounded-lg bg-slate-200" />
              <div className="h-10 w-24 rounded-lg bg-slate-200" />
            </div>
          </div>

          <div className="h-28 rounded-xl bg-white" />
          <div className="h-72 rounded-xl bg-white" />
          <div className="ml-auto h-40 w-full max-w-sm rounded-xl bg-white" />
        </div>
      </main>
    );
  }

  if (!invoice) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Invoice not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The requested invoice could not be found.
          </p>

          <Link
            href="/client/dashboard"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700 underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const canPay =
    invoice.status === "ISSUED" &&
    invoice.paymentStatus === "UNPAID";

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link
            href="/client/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {invoice.invoiceNumber}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Invoice details and payment information.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                void handleDownload()
              }
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />

              {downloading
                ? "Downloading..."
                : "Download PDF"}
            </button>

            {canPay && (
              <button
                type="button"
                onClick={() =>
                  void handlePay()
                }
                disabled={paying}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" />

                {paying
                  ? "Redirecting..."
                  : "Pay Now"}
              </button>
            )}
          </div>
        </header>

        <InvoiceDetails invoice={invoice} />
      </div>
    </main>
  );
}