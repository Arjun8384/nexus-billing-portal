export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-red-600">
          404
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Page Not Found
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          The requested page could not be found.
        </p>

        <a
          href="/login"
          className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Go to Login
        </a>
      </div>
    </main>
  );
}