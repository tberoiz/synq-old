"use client";

// REACT
import React, { useCallback, useMemo, useState } from "react";

// TYPES
import type { ItemTableRow, ItemDetails } from "@synq/supabase/types";

// COMPONENTS
import { DataTable } from "@ui/shared/components/data-table/data-table";
import { DeleteActionDialog } from "@ui/shared/components/dialogs/delete-action-dialog";
import { CreateItemDialog } from "@ui/modules/inventory/items/components/dialogs/create-item-dialog";
import { ItemDetailsSheet } from "@ui/modules/inventory/items/components/sheets/item-details-sheet";
import { CategoryFilter } from "@ui/modules/inventory/items/components/filters/category-filter";
import { Button } from "@synq/ui/button";
import { Trash2 } from "lucide-react";

// HOOKS
import { useItemsColumns } from "@ui/modules/inventory/items/hooks/use-items-columns";
import { useItems } from "@ui/modules/inventory/items/hooks/use-items";

import { useQueryState } from 'nuqs'

export function ItemsTableClient({
  items: initialItems,
}: {
  items: ItemTableRow[];
}) {
  const [detailsItemId, setDetailsItemId] = useQueryState('itemId', {
    parse: (value): Pick<ItemDetails, "item_id"> | null =>
      value ? { item_id: value } : null,
    serialize: (value) => value?.item_id ?? null
  });

  const [actionItemId, setActionItemId] = React.useState<string | null>(null);
  const [dialogType, setDialogType] = React.useState<"delete" | "bulk_delete" | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const { items, setFilters, mutations, infiniteQuery } =
    useItems(initialItems);

  const handleSearch = useCallback(
    (term: string) => setFilters((prev) => ({ ...prev, searchTerm: term })),
    [setFilters]
  );

  const handleCategoryChange = useCallback(
    (categoryId: string | null) =>
      setFilters((prev) => ({ ...prev, categoryId })),
    [setFilters]
  );

  const handleDelete = useCallback((item: ItemTableRow | string) => {
    const itemId = typeof item === 'string' ? item : item.item_id;
    if (itemId) {
      setActionItemId(itemId);
      setDialogType("delete");
    }
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selectedItems.size === 0) return;
    setDialogType("bulk_delete");
  }, [selectedItems]);

  const handleDialogAction = useCallback(async () => {
    if (!dialogType) return;

    try {
      if (dialogType === "delete" && actionItemId) {
        await mutations.delete(actionItemId);
      } else if (dialogType === "bulk_delete") {
        await Promise.all(
          Array.from(selectedItems).map((itemId) => mutations.delete(itemId))
        );
        setSelectedItems(new Set());
      }
    } catch (error) {
      console.error("Operation failed:", error);
    } finally {
      setDialogType(null);
      setActionItemId(null);
    }
  }, [actionItemId, dialogType, mutations, selectedItems]);

  const handleSelectItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedItems((prev) => {
      if (prev.size === items.length) {
        return new Set();
      }
      return new Set(items.map((item) => item.item_id));
    });
  }, [items]);

  const columns = useItemsColumns({
    onDelete: handleDelete,
    selectedItems,
    onSelectItem: handleSelectItem,
    onSelectAll: handleSelectAll,
  });

  const tableProps = useMemo(
    () => ({
      columns,
      data: items,
      actions: (
        <div className="flex items-center gap-2">
          {selectedItems.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedItems.size})
            </Button>
          )}
          <CreateItemDialog />
        </div>
      ),
      searchPlaceholder: "Search items...",
      enableRowSelection: true,
      searchColumn: "item_name",
      idKey: "item_id",
      onRowClick: (item: ItemTableRow) => {
        // Don't open details if clicking on checkbox
        const target = event?.target as HTMLElement;
        if (target?.closest('[role="checkbox"]')) return;
        setDetailsItemId(item.item_id ? { item_id: item.item_id } : null);
      },
      hasNextPage: infiniteQuery.hasNextPage,
      isFetchingNextPage: infiniteQuery.isFetchingNextPage,
      onLoadMore: () => infiniteQuery.fetchNextPage(),
      onSearch: handleSearch,
      filterComponent: (
        <CategoryFilter onCategoryChange={handleCategoryChange} />
      ),
      selectedRows: items.filter((item) => selectedItems.has(item.item_id)),
      onRowSelectionChange: (rows: ItemTableRow[]) => {
        setSelectedItems(new Set(rows.map((row) => row.item_id)));
      },
    }),
    [columns, items, infiniteQuery, handleSearch, handleCategoryChange, selectedItems, handleBulkDelete]
  );

  return (
    <>
      <DataTable {...tableProps} />

      <ItemDetailsSheet
        itemId={detailsItemId}
        open={!!detailsItemId}
        onOpenChange={(open: boolean) => !open && setDetailsItemId(null)}
        onDelete={handleDelete}
      />

      <DeleteActionDialog
        isOpen={!!dialogType}
        onOpenChange={(open: boolean) => !open && setDialogType(null)}
        actionType={dialogType}
        onConfirm={handleDialogAction}
        title={dialogType === "bulk_delete" ? `Delete ${selectedItems.size} items?` : "Delete item?"}
        description={dialogType === "bulk_delete" 
          ? `Are you sure you want to delete ${selectedItems.size} items? This action cannot be undone.`
          : "Are you sure you want to delete this item? This action cannot be undone."}
      />
    </>
  );
}
