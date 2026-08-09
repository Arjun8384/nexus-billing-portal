export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-red-600">
          403
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Unauthorized
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          You do not have permission to
          access this resource.
        </p>

        <a
          href="/login"
          className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Return to Login
        </a>
      </div>
    </main>
  );
}