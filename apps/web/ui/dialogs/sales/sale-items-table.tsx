"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@synq/supabase/client";
import { getUserId } from "@synq/supabase/queries";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { CreateSaleInput } from "@synq/supabase/types";

interface PurchaseItem {
  id: string;
  item: {
    id: string;
    name: string;
    sku: string;
  };
  remaining_quantity: number;
  unit_cost: number;
}

export function SaleItemsTable() {
  const { control } = useFormContext<CreateSaleInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Fetch available purchase items
  const { data: purchaseItems, isLoading } = useQuery({
    queryKey: ["purchase-items"],
    queryFn: async () => {
      const supabase = createClient();
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("user_purchase_items")
        .select(
          `
          id,
          remaining_quantity,
          unit_cost,
          item:user_inventory_items!inner (
            id,
            name,
            sku
          )
        `,
        )
        .eq("user_id", userId)
        .gt("remaining_quantity", 0)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as PurchaseItem[];
    },
  });

  const addItem = (purchaseItem: PurchaseItem) => {
    append({
      purchaseItemId: purchaseItem.id,
      quantity: 1,
      salePrice: 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : purchaseItems?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No items available.
                </TableCell>
              </TableRow>
            ) : (
              purchaseItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.item.name}</TableCell>
                  <TableCell>{item.item.sku}</TableCell>
                  <TableCell className="text-right">
                    {item.remaining_quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    ${item.unit_cost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addItem(item)}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Sale Price</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No items added to sale.
                </TableCell>
              </TableRow>
            ) : (
              fields.map((field, index) => {
                const purchaseItem = purchaseItems?.find(
                  (item) => item.id === field.purchaseItemId,
                );
                if (!purchaseItem) return null;

                return (
                  <TableRow key={field.id}>
                    <TableCell>{purchaseItem.item.name}</TableCell>
                    <TableCell>{purchaseItem.item.sku}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="1"
                        max={purchaseItem.remaining_quantity}
                        className="w-20 text-right"
                        {...control.register(
                          `items.${index}.quantity` as const,
                          {
                            valueAsNumber: true,
                          },
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-24 text-right"
                        {...control.register(
                          `items.${index}.salePrice` as const,
                          {
                            valueAsNumber: true,
                          },
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
