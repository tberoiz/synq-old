"use client";

import { useCallback } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { CheckSquare } from "lucide-react";
import { ImportItemWithDetails } from "@synq/supabase/types";

interface UseImportItemsColumnsProps {
  selectedItems: Set<string>;
  filteredData: ImportItemWithDetails[];
  onSelectAll: () => void;
  onSelectItem: (itemId: string) => void;
}

export function useImportItemsColumns({
  selectedItems,
  filteredData,
  onSelectAll,
  onSelectItem,
}: UseImportItemsColumnsProps) {
  const columns: ColumnDef<ImportItemWithDetails>[] = [
    {
      id: "select",
      header: () => (
        <CheckSquare
          className={`h-4 w-4 cursor-pointer ${
            selectedItems.size === filteredData.length
              ? "text-primary"
              : "text-muted-foreground"
          }`}
          onClick={onSelectAll}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <CheckSquare
          className={`h-4 w-4 cursor-pointer ${
            selectedItems.has(row.original.item_id)
              ? "text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => onSelectItem(row.original.item_id)}
        />
      ),
    },
    {
      accessorKey: "item_name",
      header: "Item Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.item_name}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.category || "-"}
        </div>
      ),
    },
    {
      accessorKey: "listing_price",
      header: "Price",
      cell: ({ row }) => (
        <div className="font-medium">
          ${(row.original.listing_price || 0).toFixed(2)}
        </div>
      ),
    },
  ];

  return columns;
} 
