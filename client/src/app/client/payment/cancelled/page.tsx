import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelledPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Payment Cancelled
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          The payment was cancelled or was not completed.
          Your invoice has not been marked as paid.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/client/dashboard"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}