"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

export interface InvoiceFormItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceItemsEditorProps {
  items: InvoiceFormItem[];
  onChange: (items: InvoiceFormItem[]) => void;
}

export default function InvoiceItemsEditor({
  items,
  onChange,
}: InvoiceItemsEditorProps) {
  function updateItem(
    index: number,
    field: keyof InvoiceFormItem,
    value: string
  ) {
    const updated = [...items];

    if (field === "description") {
      updated[index] = {
        ...updated[index],
        description: value,
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: Number(value),
      };
    }

    onChange(updated);
  }

  function addItem() {
    onChange([
      ...items,
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    if (items.length === 1) return;

    onChange(
      items.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Invoice Items
        </h2>

        <Button
          type="button"
          variant="outline"
          onClick={addItem}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-[1fr_120px_150px_auto]"
          >
            <Input
              placeholder="Item description"
              value={item.description}
              onChange={(event) =>
                updateItem(
                  index,
                  "description",
                  event.target.value
                )
              }
              required
            />

            <Input
              type="number"
              min="1"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(event) =>
                updateItem(
                  index,
                  "quantity",
                  event.target.value
                )
              }
              required
            />

            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Unit price"
              value={item.unitPrice}
              onChange={(event) =>
                updateItem(
                  index,
                  "unitPrice",
                  event.target.value
                )
              }
              required
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={items.length === 1}
              onClick={() => removeItem(index)}
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}