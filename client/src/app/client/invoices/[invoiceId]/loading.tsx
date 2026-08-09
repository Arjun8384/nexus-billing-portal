export default function InvoiceDetailsLoading() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />

            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-slate-200" />

          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded bg-slate-100" />
            <div className="h-12 animate-pulse rounded bg-slate-100" />
            <div className="h-12 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
    </main>
  );
}