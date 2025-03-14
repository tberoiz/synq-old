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
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { CreateSaleInput } from "@synq/supabase/types";
import { format } from "date-fns";

interface PurchaseItem {
  id: string;
  item: {
    id: string;
    name: string;
    sku: string;
  };
  remaining_quantity: number;
  unit_cost: number;
  batch: {
    id: string;
    name: string;
    created_at: string;
  };
}

interface BatchGroup {
  batchId: string;
  batchName: string;
  purchaseDate: string;
  items: PurchaseItem[];
}

export function SaleItemsTable() {
  const { control } = useFormContext<CreateSaleInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const [expandedBatches, setExpandedBatches] = React.useState<Set<string>>(
    new Set(),
  );

  // Fetch available purchase items
  const { data: purchaseItems, isLoading } = useQuery({
    queryKey: ["purchase-items"],
    queryFn: async () => {
      try {
        const supabase = createClient();
        const userId = await getUserId();
        console.log("Fetching items for user:", userId);

        const { data, error } = await supabase
          .from("user_purchase_items")
          .select(
            `
            id,
            remaining_quantity,
            unit_cost,
            batch:user_purchase_batches!inner (
              id,
              name,
              created_at
            ),
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

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }

        console.log("Fetched purchase items:", data);
        return data as unknown as PurchaseItem[];
      } catch (err) {
        console.error("Error in queryFn:", err);
        throw err;
      }
    },
  });

  const groupedByBatch = React.useMemo(() => {
    console.log("Grouping items:", purchaseItems);
    if (!purchaseItems) return [];

    const groups = purchaseItems.reduce(
      (acc, item) => {
        const key = item.batch.id;
        if (!acc[key]) {
          acc[key] = {
            batchId: item.batch.id,
            batchName: item.batch.name,
            purchaseDate: item.batch.created_at,
            items: [],
          };
        }
        acc[key].items.push(item);
        return acc;
      },
      {} as Record<string, BatchGroup>,
    );

    const result = Object.values(groups);
    console.log("Grouped batches:", result);
    return result;
  }, [purchaseItems]);

  const toggleBatch = (batchId: string) => {
    setExpandedBatches((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) {
        next.delete(batchId);
      } else {
        next.add(batchId);
      }
      return next;
    });
  };

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
              <TableHead className="w-8"></TableHead>
              <TableHead>Batch / Item</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : groupedByBatch.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No items available. Please add items to your inventory first.
                </TableCell>
              </TableRow>
            ) : (
              groupedByBatch.map((batch) => (
                <React.Fragment key={batch.batchId}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleBatch(batch.batchId)}
                  >
                    <TableCell>
                      {expandedBatches.has(batch.batchId) ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {batch.batchName}
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(batch.purchaseDate), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell colSpan={4}></TableCell>
                  </TableRow>
                  {expandedBatches.has(batch.batchId) &&
                    batch.items.map((item) => (
                      <TableRow key={item.id} className="bg-muted/30">
                        <TableCell></TableCell>
                        <TableCell className="pl-8">{item.item.name}</TableCell>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              addItem(item);
                            }}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
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
                    <TableCell>
                      {purchaseItem.item.name}
                      <div className="text-xs text-muted-foreground">
                        {purchaseItem.batch.name}
                      </div>
                    </TableCell>
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
