import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Payment Successful
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your payment has been received successfully.
          Your invoice will be updated once the payment
          confirmation is processed.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/client/dashboard"
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/client/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            View My Invoices
          </Link>
        </div>
      </div>
    </main>
  );
}