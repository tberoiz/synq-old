"use client";

// React
import { useState, useMemo, useCallback } from "react";

// Types
import { ImportItemWithDetails } from "@synq/supabase/types";
import { type ColumnDef } from "@tanstack/react-table";

// Third-party
import { useDebounce } from "use-debounce";

// UI Components
import { Input } from "@synq/ui/input";
import { DataTable } from "@ui/shared/components/data-table/data-table";

// Local Components
import { CreateItemDialog } from "@ui/modules/inventory/items/components/dialogs/create-item-dialog";
import { useItemsColumns } from "@ui/modules/inventory/items/hooks/use-items-columns";
import { useItems } from "@ui/modules/inventory/items/hooks/use-items";

interface ImportItemsTableProps {
  onSelectionChange: (items: ImportItemWithDetails[]) => void;
}

export default function ImportItemsTable({
  onSelectionChange,
}: ImportItemsTableProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedValue] = useDebounce(searchTerm, 300);

  // Use the cached items data
  const { items, setFilters } = useItems();

  const filteredData = useMemo(() => {
    if (!debouncedValue) return items;
    const query = debouncedValue.toLowerCase();
    return items.filter(
      (item) =>
        item.item_name.toLowerCase().includes(query) ||
        (item.sku?.toLowerCase() || "").includes(query) ||
        (item.category?.toLowerCase() || "").includes(query)
    );
  }, [items, debouncedValue]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === filteredData.length) {
      setSelectedItems(new Set());
      onSelectionChange([]);
    } else {
      const newSelected = new Set(filteredData.map((item) => item.item_id));
      setSelectedItems(newSelected);
      onSelectionChange(filteredData as ImportItemWithDetails[]);
    }
  }, [filteredData, selectedItems.size, onSelectionChange]);

  const handleSelectItem = useCallback(
    (itemId: string) => {
      const newSelected = new Set(selectedItems);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      setSelectedItems(newSelected);
      onSelectionChange(
        filteredData.filter((item) =>
          newSelected.has(item.item_id)
        ) as ImportItemWithDetails[]
      );
    },
    [selectedItems, filteredData, onSelectionChange]
  );

  // Get the base columns from useItemsColumns
  const baseColumns = useItemsColumns({
    onDelete: () => {}, // No-op since we don't need delete functionality
    selectedItems: new Set(),
    onSelectItem: () => {}, // No-op since we handle selection separately
    onSelectAll: () => {}, // No-op since we handle selection separately
  });

  // Filter and modify columns to only show what we need
  const columns = useMemo(() => {
    const selectColumn: ColumnDef<ImportItemWithDetails> = {
      id: "select",
      header: () => (
        <div className="flex items-center justify-center">
          <Input
            type="checkbox"
            className="h-4 w-4 rounded focus:ring-primary"
            checked={selectedItems.size === filteredData.length}
            onChange={handleSelectAll}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={selectedItems.has(row.original.item_id)}
            onChange={() => handleSelectItem(row.original.item_id)}
          />
        </div>
      ),
    };

    // Only keep the columns we need
    const neededColumns = baseColumns.filter((col) => {
      const key = (col as { accessorKey?: string }).accessorKey;
      return (
        key === "item_name" || key === "category" || key === "listing_price"
      );
    });

    return [
      selectColumn,
      ...neededColumns,
    ] as ColumnDef<ImportItemWithDetails>[];
  }, [
    baseColumns,
    selectedItems,
    filteredData.length,
    handleSelectAll,
    handleSelectItem,
  ]);

  const handleSearch = useCallback(
    (term: string) => setFilters((prev) => ({ ...prev, searchTerm: term })),
    [setFilters]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto">
        <DataTable
          columns={columns}
          data={filteredData}
          enableRowSelection={false}
          searchPlaceholder="Search items..."
          searchColumn="item_name"
          onSearch={handleSearch}
          idKey="import_item_id"
          actions={<CreateItemDialog />}
          onRowClick={(item) => handleSelectItem(item.item_id)}
        />
      </div>
    </div>
  );
}
