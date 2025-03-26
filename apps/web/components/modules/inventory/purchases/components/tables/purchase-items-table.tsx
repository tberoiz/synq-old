"use client";

// React core imports
import * as React from "react";
import { useState, useImperativeHandle, useMemo } from "react";
import { cn } from "@synq/ui/utils";
import { Button } from "@synq/ui/button";
import { RotateCcw } from "lucide-react";

// Types
import { ItemDetails, PurchaseItemWithDetails } from "@synq/supabase/types";
import { ColumnDef } from "@tanstack/react-table";

// Components
import { DataTable } from "@ui/shared/components/data-table/data-table";
import { usePurchaseItemsColumns } from "@ui/modules/inventory/purchases/hooks/use-purchase-items-columns";
import { ItemDetailsSheet } from "@ui/modules/inventory/items/components/sheets/item-details-sheet";
import { Input } from "@synq/ui/input";
import { ImportItemsDialog } from "../../components/dialogs/import-items-dialog";
import { ImportItem } from "@synq/supabase/types";

interface PurchaseItemsTableProps {
  data: PurchaseItemWithDetails[];
  onRemoveItem: (id: string) => void;
  onSaveBatch: (
    updates: Map<string, { quantity: number; unit_cost: number }>,
  ) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  bundleMode?: boolean;
  manualAllocation?: boolean;
  onImport?: (selectedItems: ImportItem[]) => Promise<void>;
  showDetailIcon?: boolean;
}

export interface PurchaseItemsTableRef {
  getUpdates: () => Map<string, { quantity: number; unit_cost: number }>;
  resetChanges: () => void;
  applyUpdates: (updates: Map<string, { quantity: number; unit_cost: number }>) => void;
}

export const PurchaseItemsTable = React.forwardRef<
  PurchaseItemsTableRef,
  PurchaseItemsTableProps
>(
  (
    { data, onRemoveItem, onDirtyChange, bundleMode = false, manualAllocation = false, onImport, showDetailIcon = false },
    ref,
  ) => {
    const [selectedItem, setSelectedItem] = React.useState<
     Pick<ItemDetails, 'item_id'> | null
    >(null);
    const [localData, setLocalData] = useState<
      Map<string, { quantity: number; unit_cost: number }>
    >(new Map());

    useImperativeHandle(ref, () => ({
      getUpdates: () => localData,
      resetChanges: () => {
        setLocalData(new Map());
        if (onDirtyChange) onDirtyChange(false);
      },
      applyUpdates: (updates: Map<string, { quantity: number; unit_cost: number }>) => {
        setLocalData(new Map(updates));
        if (onDirtyChange) onDirtyChange(true);
      }
    }));

    const handleValueChange = (id: string, field: "quantity" | "unit_cost", value: number) => {
      const currentUpdate = localData.get(id) || {
        quantity: data.find((item) => item.id === id)?.quantity || 0,
        unit_cost: data.find((item) => item.id === id)?.unit_cost || 0,
      };
      const newUpdates = new Map(localData);
      newUpdates.set(id, { ...currentUpdate, [field]: value });
      setLocalData(newUpdates);
      onDirtyChange?.(true);
    };

    // Reset changes function
    const handleResetChanges = () => {
      setLocalData(new Map());
      onDirtyChange?.(false);
    };

    const standardColumns = usePurchaseItemsColumns({
      onRemoveItem,
      updates: localData,
      onQuantityChange: (id, value) => handleValueChange(id, "quantity", value),
      onUnitCostChange: (id, value) => handleValueChange(id, "unit_cost", value),
      showDetailIcon,
      onViewItem: (itemId) => setSelectedItem({ item_id: itemId }),
    });
    
    const bundleColumns = useMemo<ColumnDef<PurchaseItemWithDetails>[]>(
      () => [
        // Item details column
        {
          accessorKey: "name",
          header: "Item",
          cell: ({ row }) => {
            return (
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <div className="font-medium">{row.original.name}</div>
                  {row.original.sku && (
                    <div className="text-xs text-muted-foreground">SKU: {row.original.sku}</div>
                  )}
                </div>
                {showDetailIcon && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem({ item_id: row.original.item_id });
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            );
          },
        },
        // Quantity column (editable)
        {
          accessorKey: "quantity",
          header: "Quantity",
          cell: ({ row }) => {
            const originalQuantity = row.original.quantity;
            const id = row.original.id;
            const localValue = localData.get(id);
            const quantity = localValue?.quantity ?? originalQuantity;

            return (
              <div className="flex items-center justify-end">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(e) => handleValueChange(id, "quantity", parseInt(e.target.value))}
                  className="w-24 h-8 text-right"
                />
              </div>
            );
          },
        },
        // Unit cost column (editable if in manual allocation mode)
        {
          accessorKey: "unit_cost",
          header: "Unit Cost",
          cell: ({ row }) => {
            const originalUnitCost = row.original.unit_cost;
            const id = row.original.id;
            const localValue = localData.get(id);
            const unitCost = localValue?.unit_cost ?? originalUnitCost;

            return (
              <div className="flex items-center justify-end">
                {bundleMode && manualAllocation ? (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => handleValueChange(id, "unit_cost", parseFloat(e.target.value))}
                    className="w-24 h-8 text-right"
                  />
                ) : (
                  <div className={cn(
                    "text-right",
                    localValue?.unit_cost !== undefined && 
                    localValue?.unit_cost !== originalUnitCost && 
                    "font-medium text-blue-600 dark:text-blue-400"
                  )}>
                    ${unitCost.toFixed(2)}
                    {bundleMode && !manualAllocation && localValue?.unit_cost !== undefined && (
                      <div className="text-xs text-muted-foreground">Bundle allocated</div>
                    )}
                  </div>
                )}
              </div>
            );
          },
        },
        // Total cost column (calculated)
        {
          accessorKey: "total_cost",
          header: "Total Cost",
          cell: ({ row }) => {
            const id = row.original.id;
            const localValue = localData.get(id);
            const quantity = localValue?.quantity ?? row.original.quantity;
            const unitCost = localValue?.unit_cost ?? row.original.unit_cost;
            const totalCost = quantity * unitCost;
            
            return (
              <div className="text-right font-medium">
                ${totalCost.toFixed(2)}
              </div>
            );
          },
        },
        // Action column
        {
          id: "actions",
          cell: ({ row }) => (
            <div className="flex justify-end">
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => onRemoveItem(row.original.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ),
        },
      ],
      [bundleMode, manualAllocation, localData, handleValueChange, onRemoveItem, showDetailIcon, setSelectedItem]
    );

    const renderActions = useMemo(() => {
      return (
        <div className="flex items-center gap-2">
          {localData.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetChanges}
              className="flex items-center gap-1 text-xs h-8"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
          
          {onImport && (
            <ImportItemsDialog
              title="Add Items to Purchase"
              onImport={onImport}
            />
          )}
        </div>
      );
    }, [onImport, localData.size]);

    return (
      <div className="relative">
        <DataTable
          columns={bundleMode ? bundleColumns : standardColumns}
          data={data}
          enableRowSelection={false}
          searchPlaceholder="Search items..."
          actions={renderActions}
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
