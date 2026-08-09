"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createInvoice } from "@/lib/api";
import InvoiceItemsEditor, {
  type InvoiceFormItem,
} from "./InvoiceItemsEditor";

export default function InvoiceForm() {
  const router = useRouter();

  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [currency, setCurrency] = useState("USD");

  const [items, setItems] = useState<
    InvoiceFormItem[]
  >([
    {
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const [submitting, setSubmitting] =
    useState(false);

  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.quantity) *
        Number(item.unitPrice),
    0
  );

  const taxAmount =
    subtotal * (Number(taxRate) / 100);

  const total = subtotal + taxAmount;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!clientId.trim()) {
      toast.error("Client ID is required");
      return;
    }

    if (!issueDate || !dueDate) {
      toast.error(
        "Issue date and due date are required"
      );
      return;
    }

    if (
      new Date(dueDate) <
      new Date(issueDate)
    ) {
      toast.error(
        "Due date cannot be before issue date"
      );
      return;
    }

    if (
      items.some(
        (item) =>
          !item.description.trim() ||
          item.quantity <= 0 ||
          item.unitPrice < 0
      )
    ) {
      toast.error(
        "Please enter valid invoice items"
      );
      return;
    }

    try {
      setSubmitting(true);

      await createInvoice({
        clientId,
        issueDate,
        dueDate,
        taxRate: Number(taxRate),
        currency,
        items: items.map((item) => ({
          description:
            item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      });

      toast.success(
        "Invoice created successfully"
      );

      router.push("/admin/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create invoice"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Invoice Information
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="clientId"
              className="mb-2 block text-sm font-medium"
            >
              Client ID
            </label>

            <input
              id="clientId"
              value={clientId}
              onChange={(event) =>
                setClientId(event.target.value)
              }
              placeholder="Enter client ID"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              required
            />
          </div>

          <div>
            <label
              htmlFor="currency"
              className="mb-2 block text-sm font-medium"
            >
              Currency
            </label>

            <select
              id="currency"
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value)
              }
              className="w-full rounded-md border bg-white px-3 py-2 text-sm"
            >
              <option value="USD">
                USD
              </option>
              <option value="EUR">
                EUR
              </option>
              <option value="GBP">
                GBP
              </option>
              <option value="INR">
                INR
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="issueDate"
              className="mb-2 block text-sm font-medium"
            >
              Issue Date
            </label>

            <input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(event) =>
                setIssueDate(event.target.value)
              }
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="mb-2 block text-sm font-medium"
            >
              Due Date
            </label>

            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="taxRate"
              className="mb-2 block text-sm font-medium"
            >
              Tax Rate (%)
            </label>

            <input
              id="taxRate"
              type="number"
              min="0"
              step="0.01"
              value={taxRate}
              onChange={(event) =>
                setTaxRate(
                  Number(event.target.value)
                )
              }
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <InvoiceItemsEditor
          items={items}
          onChange={setItems}
        />
      </section>

      <section className="flex justify-end">
        <div className="w-full rounded-lg border bg-white p-6 shadow-sm sm:w-80">
          <div className="flex justify-between py-2 text-sm">
            <span className="text-muted-foreground">
              Subtotal
            </span>

            <span>
              {currency}{" "}
              {subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between py-2 text-sm">
            <span className="text-muted-foreground">
              Tax ({taxRate}%)
            </span>

            <span>
              {currency}{" "}
              {taxAmount.toFixed(2)}
            </span>
          </div>

          <div className="mt-2 flex justify-between border-t pt-4 text-lg font-bold">
            <span>Total</span>

            <span>
              {currency}{" "}
              {total.toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            router.push("/admin/dashboard")
          }
          disabled={submitting}
          className="rounded-md border bg-white px-5 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Creating..."
            : "Create Invoice"}
        </button>
      </div>
    </form>
  );
}