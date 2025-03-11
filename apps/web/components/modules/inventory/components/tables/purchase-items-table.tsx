"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Input } from "@synq/ui/input";
import { Button } from "@synq/ui/button";
import { Trash2 } from "lucide-react";
import { Badge } from "@synq/ui/badge";
import { PurchaseItemWithDetails } from "@synq/supabase/types";
import { DataTable } from "@ui/shared/data-table/data-table";

interface PurchaseItemsTableProps {
  data: PurchaseItemWithDetails[];
  onRemoveItem: (id: string) => void;
  onSaveBatch: (
    updates: Map<string, { quantity: number; unit_cost: number }>
  ) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  showHeader?: boolean;
}

export interface PurchaseItemsTableRef {
  getUpdates: () => Map<string, { quantity: number; unit_cost: number }>;
}

const PurchaseItemsTable = React.forwardRef<
  PurchaseItemsTableRef,
  PurchaseItemsTableProps
>(
  (
    { data, onRemoveItem, onSaveBatch, onDirtyChange, showHeader = true },
    ref
  ) => {
    const [updates, setUpdates] = React.useState<
      Map<string, { quantity: number; unit_cost: number }>
    >(new Map());

    React.useImperativeHandle(ref, () => ({
      getUpdates: () => updates,
    }));

    const handleQuantityChange = (id: string, value: number) => {
      const currentUpdate = updates.get(id) || {
        quantity: data.find((item) => item.id === id)?.quantity || 0,
        unit_cost: data.find((item) => item.id === id)?.unit_cost || 0,
      };
      const newUpdates = new Map(updates);
      newUpdates.set(id, { ...currentUpdate, quantity: value });
      setUpdates(newUpdates);
      onDirtyChange?.(true);
    };

    const handleUnitCostChange = (id: string, value: number) => {
      const currentUpdate = updates.get(id) || {
        quantity: data.find((item) => item.id === id)?.quantity || 0,
        unit_cost: data.find((item) => item.id === id)?.unit_cost || 0,
      };
      const newUpdates = new Map(updates);
      newUpdates.set(id, { ...currentUpdate, unit_cost: value });
      setUpdates(newUpdates);
      onDirtyChange?.(true);
    };

    const columns: ColumnDef<PurchaseItemWithDetails>[] = [
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
                handleQuantityChange(
                  row.original.id,
                  parseInt(e.target.value, 10)
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
                handleUnitCostChange(
                  row.original.id,
                  parseFloat(e.target.value)
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
    ];

    return (
      <div className="relative">
        <DataTable
          columns={columns}
          data={data}
          defaultPageSize={10}
          enableRowSelection={false}
          searchPlaceholder="Search items..."
        />
      </div>
    );
  }
);

PurchaseItemsTable.displayName = "PurchaseItemsTable";

export default PurchaseItemsTable;
