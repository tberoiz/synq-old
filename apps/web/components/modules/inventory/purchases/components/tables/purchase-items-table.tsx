"use client";

// React core imports
import * as React from "react";

// Types
import { ItemDetails, PurchaseItemWithDetails } from "@synq/supabase/types";

// Components
import { DataTable } from "@ui/shared/components/data-table/data-table";
import { usePurchaseItemsColumns } from "@ui/modules/inventory/purchases/hooks/use-purchase-items-columns";
import { ItemDetailsSheet } from "@ui/modules/inventory/items/components/sheets/item-details-sheet";

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
    const [selectedItem, setSelectedItem] = React.useState<
     Pick<ItemDetails, 'item_id'> | null
    >(null);
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
          onRowClick={(row) => {
            setSelectedItem(row)
          }}
        />
      <ItemDetailsSheet
        itemId={selectedItem}
        open={!!selectedItem}
        onOpenChange={(open: boolean) => !open && setSelectedItem(null)}
      />
      </div>
    );
  },
);

PurchaseItemsTable.displayName = "PurchaseItemsTable";

export default PurchaseItemsTable;
