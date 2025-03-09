"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import { Skeleton } from "@synq/ui/skeleton";
import { CheckSquare, Search } from "lucide-react";
import { InventoryItemWithDetails } from "@synq/supabase/queries";
import { Input } from "@synq/ui/input";

type ImportItem = InventoryItemWithDetails;

interface ImportItemsTableProps {
  data: ImportItem[];
  loading?: boolean;
  onSelectionChange: (selectedItems: ImportItem[]) => void;
}

export default function ImportItemsTable({
  data,
  loading,
  onSelectionChange,
}: ImportItemsTableProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);

    const selectedItemsList = data.filter((item) => newSelected.has(item.id));
    onSelectionChange(selectedItemsList);
  };

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.sku?.toLowerCase() || "").includes(query) ||
        (item.category?.name?.toLowerCase() || "").includes(query),
    );
  }, [data, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Input placeholder="Search items..." className="pl-8" disabled />
        </div>
        <div className="border overflow-x-auto lg:max-h-[800px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="relative">
        <Input
          placeholder="Search items..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
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
                        const newSelected = new Set(
                          filteredData.map((item) => item.id),
                        );
                        setSelectedItems(newSelected);
                        onSelectionChange(filteredData);
                      }
                    }}
                    aria-label="Select all rows"
                  />
                </TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead className="hidden sm:table-cell">SKU</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => handleSelectItem(item.id)}
                    data-state={
                      selectedItems.has(item.id) ? "selected" : undefined
                    }
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <CheckSquare
                        className={`h-4 w-4 cursor-pointer ${
                          selectedItems.has(item.id)
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => handleSelectItem(item.id)}
                        aria-label="Select row"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="sm:hidden text-sm text-muted-foreground">
                          <div>SKU: {item.sku || "N/A"}</div>
                          <div>Category: {item.category?.name || "N/A"}</div>
                          <div>
                            Price: ${item.listing_price?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell max-w-[120px] truncate">
                      {item.sku}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell max-w-[120px] truncate">
                      {item.category?.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      ${item.listing_price?.toFixed(2) || "0.00"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchQuery
                      ? "No items found matching your search."
                      : "No items found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
