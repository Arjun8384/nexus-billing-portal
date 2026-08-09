"use client";

import { useRouter } from "next/navigation";

export default function PaymentCancelledPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
          !
        </div>

        <h1 className="mt-5 text-2xl font-bold">
          Payment Cancelled
        </h1>

        <p className="mt-2 text-muted-foreground">
          The payment was cancelled. Your invoice remains
          unpaid and you can try again whenever you&apos;re ready.
        </p>

        <button
          type="button"
          onClick={() =>
            router.push("/client/dashboard")
          }
          className="mt-6 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}