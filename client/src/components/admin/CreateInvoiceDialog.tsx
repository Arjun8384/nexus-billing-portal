"use client";

import { useState } from "react";

import {
  createInvoice,
  type CreateInvoiceInput,
  type Invoice,
} from "@/lib/api";

interface CreateInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (invoice: Invoice) => void;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function CreateInvoiceDialog({
  open,
  onClose,
  onCreated,
}: CreateInvoiceDialogProps) {
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [currency, setCurrency] = useState("USD");

  const [items, setItems] = useState<LineItem[]>([
    {
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  function updateItem(
    index: number,
    field: keyof LineItem,
    value: string
  ) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (
          field === "quantity" ||
          field === "unitPrice"
        ) {
          return {
            ...item,
            [field]: Number(value),
          };
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!clientId.trim()) {
      setError("Client ID is required.");
      return;
    }

    if (!issueDate || !dueDate) {
      setError(
        "Issue date and due date are required."
      );
      return;
    }

    if (
      new Date(dueDate) <
      new Date(issueDate)
    ) {
      setError(
        "Due date cannot be before issue date."
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
      setError(
        "Please provide valid details for every item."
      );
      return;
    }

    const payload: CreateInvoiceInput = {
      clientId: clientId.trim(),
      issueDate,
      dueDate,
      taxRate: Number(taxRate),
      currency,
      items: items.map((item) => ({
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    try {
      setSubmitting(true);

      const invoice =
        await createInvoice(payload);

      onCreated(invoice);

      setClientId("");
      setIssueDate("");
      setDueDate("");
      setTaxRate("0");
      setCurrency("USD");

      setItems([
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ]);

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create invoice."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Create Invoice
              </h2>

              <p className="text-sm text-slate-500">
                Add billing details and line items.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xl text-slate-400 hover:text-slate-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Client ID
              </label>

              <input
                value={clientId}
                onChange={(event) =>
                  setClientId(event.target.value)
                }
                placeholder="MongoDB client user ID"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Currency
              </label>

              <select
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="USD">
                  USD
                </option>
                <option value="INR">
                  INR
                </option>
                <option value="EUR">
                  EUR
                </option>
                <option value="GBP">
                  GBP
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Issue Date
              </label>

              <input
                type="date"
                value={issueDate}
                onChange={(event) =>
                  setIssueDate(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Due Date
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Tax Rate (%)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={taxRate}
                onChange={(event) =>
                  setTaxRate(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                Invoice Items
              </h3>

              <button
                type="button"
                onClick={addItem}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_100px_130px_auto]"
                >
                  <input
                    value={item.description}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Description"
                    className="rounded-lg border px-3 py-2 text-sm"
                  />

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "quantity",
                        event.target.value
                      )
                    }
                    className="rounded-lg border px-3 py-2 text-sm"
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "unitPrice",
                        event.target.value
                      )
                    }
                    className="rounded-lg border px-3 py-2 text-sm"
                  />

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeItem(index)
                      }
                      className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}