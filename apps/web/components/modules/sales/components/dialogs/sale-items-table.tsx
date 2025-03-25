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
  SearchIcon,
} from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { CreateSaleInput } from "@synq/supabase/types";
import { format } from "date-fns";

interface PurchaseItem {
  id: string;
  item: {
    id: string;
    name: string;
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
  const [expandedBatches, setExpandedBatches] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch available purchase items
  const { data: purchaseItems, isLoading } = useQuery({
    queryKey: ["purchase-items"],
    queryFn: async () => {
      try {
        const supabase = createClient();
        const userId = await getUserId();

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

        if (error) throw error;
        return data as unknown as PurchaseItem[];
      } catch (err) {
        console.error("Error fetching purchase items:", err);
        throw err;
      }
    },
  });

  const groupedByBatch = React.useMemo(() => {
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

    return Object.values(groups);
  }, [purchaseItems]);

  const filteredGroups = React.useMemo(() => {
    if (!searchQuery) return groupedByBatch;

    const query = searchQuery.toLowerCase();
    return groupedByBatch.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.item.name.toLowerCase().includes(query)
      )
    })).filter(group => group.items.length > 0);
  }, [groupedByBatch, searchQuery]);

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
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading items...
                  </TableCell>
                </TableRow>
              ) : filteredGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {searchQuery ? "No items found" : "No items available"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map((batch) => (
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
                      <TableCell colSpan={4} className="font-medium">
                        {batch.batchName}
                        <div className="text-xs text-muted-foreground">
                          Purchased on {format(new Date(batch.purchaseDate), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedBatches.has(batch.batchId) &&
                      batch.items.map((item) => (
                        <TableRow key={item.id} className="bg-muted/30">
                          <TableCell></TableCell>
                          <TableCell className="pl-8">{item.item.name}</TableCell>
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
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Sale Price</TableHead>
                <TableHead className="w-[50px]"></TableHead>
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
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="1"
                          max={purchaseItem.remaining_quantity}
                          className="w-20 text-right"
                          {...control.register(`items.${index}.quantity` as const, {
                            valueAsNumber: true,
                          })}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-24 text-right"
                          {...control.register(`items.${index}.salePrice` as const, {
                            valueAsNumber: true,
                          })}
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
    </div>
  );
}
