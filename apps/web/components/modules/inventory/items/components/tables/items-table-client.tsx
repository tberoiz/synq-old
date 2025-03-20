"use client";

// REACT
import React, { useCallback, useMemo } from "react";

// TYPES
import type { ItemTableRow, ItemDetails } from "@synq/supabase/types";

// COMPONENTS
import { DataTable } from "@ui/shared/components/data-table/data-table";
import { ActionDialog } from "@ui/shared/components/dialogs/action-dialog";
import { CreateItemDialog } from "@ui/modules/inventory/items/components/dialogs/create-item-dialog";
import { ItemDetailsSheet } from "@ui/modules/inventory/items/components/sheets/item-details-sheet";
import { CategoryFilter } from "@ui/modules/inventory/items/components/filters/category-filter";

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
  const [dialogType, setDialogType] = React.useState<
    "archive" | "restore" | null
  >(null);

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

  const handleDialogAction = useCallback(async () => {
    if (!actionItemId) return;

    try {
      if (dialogType === "archive") {
        await mutations.archive(actionItemId);
      } else if (dialogType === "restore") {
        await mutations.restore(actionItemId);
      }
    } catch (error) {
      console.error("Operation failed:", error);
    } finally {
      setDialogType(null);
      setActionItemId(null);
    }
  }, [actionItemId, dialogType, mutations]);

  const columns = useItemsColumns({
    onArchive: useCallback((item) => {
      if (item.item_id) {
        setActionItemId(item.item_id);
        setDialogType("archive");
      }
    }, []),
    onRestore: useCallback((item) => {
      if (item.item_id) {
        setActionItemId(item.item_id);
        setDialogType("restore");
      }
    }, []),
  });

  const tableProps = useMemo(
    () => ({
      columns,
      data: items,
      actions: <CreateItemDialog />,
      searchPlaceholder: "Search items...",
      enableRowSelection: false,
      searchColumn: "item_name",
      idKey: "item_id",
      onRowClick: (item: ItemTableRow) =>
        setDetailsItemId(item.item_id ? { item_id: item.item_id } : null),
      hasNextPage: infiniteQuery.hasNextPage,
      isFetchingNextPage: infiniteQuery.isFetchingNextPage,
      onLoadMore: () => infiniteQuery.fetchNextPage(),
      onSearch: handleSearch,
      filterComponent: (
        <CategoryFilter onCategoryChange={handleCategoryChange} />
      ),
    }),
    [columns, items, infiniteQuery, handleSearch, handleCategoryChange]
  );

  return (
    <>
      <DataTable {...tableProps} />

      <ItemDetailsSheet
        itemId={detailsItemId}
        open={!!detailsItemId}
        onOpenChange={(open: boolean) => !open && setDetailsItemId(null)}
      />

      <ActionDialog
        isOpen={!!dialogType}
        onOpenChange={(open: boolean) => !open && setDialogType(null)}
        actionType={dialogType}
        onConfirm={handleDialogAction}
      />
    </>
  );
}
