"use client";

import { useState, useMemo, useCallback } from "react";
import { Skeleton } from "@synq/ui/skeleton";
import { Search } from "lucide-react";
import { ImportItemWithDetails } from "@synq/supabase/types";
import { Input } from "@synq/ui/input";
import { DataTable } from "@ui/shared/components/data-table/data-table";
import { useDebounce } from "use-debounce";
import { useImportItemsColumns } from "../../hooks/use-import-items-columns";

interface ImportItemsTableProps {
  data: ImportItemWithDetails[];
  loading?: boolean;
  onSelectionChange: (items: ImportItemWithDetails[]) => void;
}

export default function ImportItemsTable({
  data,
  loading,
  onSelectionChange,
}: ImportItemsTableProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedValue] = useDebounce(searchTerm, 300);

  const filteredData = useMemo(() => {
    if (!debouncedValue) return data;
    const query = debouncedValue.toLowerCase();
    return data.filter(
      (item) =>
        item.item_name.toLowerCase().includes(query) ||
        (item.sku?.toLowerCase() || "").includes(query) ||
        (item.category?.toLowerCase() || "").includes(query)
    );
  }, [data, debouncedValue]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === filteredData.length) {
      setSelectedItems(new Set());
      onSelectionChange([]);
    } else {
      const newSelected = new Set(filteredData.map((item) => item.item_id));
      setSelectedItems(newSelected);
      onSelectionChange(filteredData);
    }
  }, [filteredData, selectedItems.size, onSelectionChange]);

  const handleSelectItem = useCallback((itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    onSelectionChange(
      filteredData.filter((item) => newSelected.has(item.item_id))
    );
  }, [selectedItems, filteredData, onSelectionChange]);

  const columns = useImportItemsColumns({
    selectedItems,
    filteredData,
    onSelectAll: handleSelectAll,
    onSelectItem: handleSelectItem,
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-8"
            disabled
          />
        </div>
        <div className="border rounded-md overflow-x-auto">
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="border rounded-md">
        <DataTable
          columns={columns}
          data={filteredData}
          enableRowSelection={false}
          searchPlaceholder="Search items..."
          searchColumn="item_name"
          onSearch={setSearchTerm}
          idKey="item_id"
        />
      </div>
    </div>
  );
}
