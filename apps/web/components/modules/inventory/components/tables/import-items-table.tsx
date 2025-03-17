"use client";

import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@synq/ui/skeleton";
import { CheckSquare } from "lucide-react";
import { InventoryItemWithDetails } from "@synq/supabase/types";
import { Input } from "@synq/ui/input";
import { DataTable } from "@ui/shared/data-table/data-table";

type ImportItem = InventoryItemWithDetails;

interface ImportItemsTableProps {
  data: ImportItem[];
  loading?: boolean;
  onSelectionChange: (items: ImportItem[]) => void;
}

export default function ImportItemsTable({
  data,
  loading,
  onSelectionChange,
}: ImportItemsTableProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item?.sku?.toLowerCase().includes(query),
    );
  }, [data, searchQuery]);

  const columns: ColumnDef<ImportItem>[] = [
    {
      id: "select",
      header: () => (
        <CheckSquare
          className={`h-4 w-4 cursor-pointer ${
            selectedItems.size === filteredData.length
              ? "text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => {
            if (selectedItems.size === filteredData.length) {
              setSelectedItems(new Set());
              onSelectionChange([]);
            } else {
              const newSelected = new Set(filteredData.map((item) => item.id));
              setSelectedItems(newSelected);
              onSelectionChange(filteredData);
            }
          }}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <CheckSquare
          className={`h-4 w-4 cursor-pointer ${
            selectedItems.has(row.original.id)
              ? "text-primary"
              : "text-muted-foreground"
          }`}
          onClick={() => {
            const newSelected = new Set(selectedItems);
            if (newSelected.has(row.original.id)) {
              newSelected.delete(row.original.id);
            } else {
              newSelected.add(row.original.id);
            }
            setSelectedItems(newSelected);
            onSelectionChange(
              filteredData.filter((item) => newSelected.has(item.id)),
            );
          }}
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Item Name",
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <div className="hidden sm:table-cell">{row.original.sku}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="hidden sm:table-cell">{row.original.category}</div>
      ),
    },
    {
      accessorKey: "listing_price",
      header: "Price",
      cell: ({ row }) => (
        <div className="hidden sm:table-cell">
          ${row.original.listing_price.toFixed(2)}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Input placeholder="Search items..." className="pl-8" disabled />
        </div>
        <div className="border overflow-x-auto lg:max-h-[800px] overflow-y-auto">
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      enableRowSelection={false}
      searchPlaceholder="Search items..."
    />
  );
}
