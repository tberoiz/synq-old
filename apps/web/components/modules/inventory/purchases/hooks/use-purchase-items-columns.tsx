import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Input } from "@synq/ui/input";
import { Button } from "@synq/ui/button";
import { Trash2 } from "lucide-react";
import { Badge } from "@synq/ui/badge";
import { PurchaseItemWithDetails } from "@synq/supabase/types";

interface UsePurchasesColumnsProps {
  onRemoveItem: (id: string) => void;
  updates: Map<string, { quantity: number; unit_cost: number }>;
  onQuantityChange: (id: string, value: number) => void;
  onUnitCostChange: (id: string, value: number) => void;
}

export function usePurchaseItemsColumns({
  onRemoveItem,
  updates,
  onQuantityChange,
  onUnitCostChange,
}: UsePurchasesColumnsProps) {
  return useMemo(
    () =>
      [
        {
          accessorKey: "name",
          header: "Item",
          cell: ({ row }) => (
            <div className="space-y-1">
              <div className="font-medium flex items-center gap-2">
                {row.original.name}
                {row.original.is_archived && (
                  <Badge variant="outline" className="text-xs">
                    archived
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                SKU: {row.original.sku}
              </div>
            </div>
          ),
        },
        {
          accessorKey: "quantity",
          header: "Quantity",
          cell: ({ row }) => {
            const update = updates.get(row.original.id);
            const quantity = update?.quantity ?? row.original.quantity;
            return (
              <Input
                type="number"
                min="1"
                className="h-8"
                value={quantity}
                onChange={(e) =>
                  onQuantityChange(
                    row.original.id,
                    parseInt(e.target.value, 10),
                  )
                }
              />
            );
          },
        },
        {
          accessorKey: "unit_cost",
          header: "Unit Cost",
          cell: ({ row }) => {
            const update = updates.get(row.original.id);
            const unitCost = update?.unit_cost ?? row.original.unit_cost;
            return (
              <Input
                type="number"
                min="0"
                step="0.01"
                className="h-8"
                value={unitCost}
                onChange={(e) =>
                  onUnitCostChange(
                    row.original.id,
                    parseFloat(e.target.value),
                  )
                }
              />
            );
          },
        },
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }) => (
            <div className="text-right">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveItem(row.original.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        },
      ] as ColumnDef<PurchaseItemWithDetails>[],
    [updates, onRemoveItem, onQuantityChange, onUnitCostChange],
  );
}
