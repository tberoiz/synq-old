"use client";

import * as React from "react";
import { PurchaseItemWithDetails } from "@synq/supabase/types";
import { DataTable } from "@ui/shared/data-table/data-table";
import { usePurchaseItemsColumns } from "@ui/modules/inventory/purchases/hooks/use-purchase-items-columns";

interface PurchaseItemsTableProps {
  data: PurchaseItemWithDetails[];
  onRemoveItem: (id: string) => void;
  onSaveBatch: (
    updates: Map<string, { quantity: number; unit_cost: number }>,
  ) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  showHeader?: boolean;
}

export interface PurchaseItemsTableRef {
  getUpdates: () => Map<string, { quantity: number; unit_cost: number }>;
}

export const PurchaseItemsTable = React.forwardRef<
  PurchaseItemsTableRef,
  PurchaseItemsTableProps
>(
  (
    { data, onRemoveItem, onDirtyChange },
    ref,
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

    const columns = usePurchaseItemsColumns({
      onRemoveItem,
      updates,
      onQuantityChange: handleQuantityChange,
      onUnitCostChange: handleUnitCostChange,
    });

    return (
      <div className="relative">
        <DataTable
          columns={columns}
          data={data}
          enableRowSelection={false}
          searchPlaceholder="Search items..."
        />
      </div>
    );
  },
);

PurchaseItemsTable.displayName = "PurchaseItemsTable";

export default PurchaseItemsTable;
