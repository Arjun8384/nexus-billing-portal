import InvoiceForm from "@/components/admin/InvoiceForm";

export default function CreateInvoicePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Create Invoice
          </h1>

          <p className="mt-1 text-muted-foreground">
            Create a new invoice for a client.
          </p>
        </div>

        <InvoiceForm />
      </div>
    </main>
  );
}