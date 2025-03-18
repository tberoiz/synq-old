"use client";

import React from "react";
import { useInfiniteQuery, useQueryClient} from "@tanstack/react-query";

// External
import { DataTable } from "@ui/shared/data-table/data-table";
import { createClient } from "@synq/supabase/client";
import { archiveItem, restoreItem, fetchItemsView, getUserId } from "@synq/supabase/queries";

// Dialogs
import { CreateItemDialog } from "../dialogs/create-item-dialog";
import { ArchiveDialog } from "@ui/shared/dialogs/archive-dialog";
import { RestoreDialog } from "@ui/shared/dialogs/restore-dialog";

// Sheets
import ItemDetailsSheet from "../sheets/item-details-sheet";

// Filters
import { CategoryFilter } from "../filters/category-filter";

// Columns
import { useItemsColumns } from "@ui/modules/inventory/items/hooks/use-items-columns";
// Types
import { ItemTableRow } from "@synq/supabase/types";

export function ItemsTableClient({ items: initialItems }: { items: ItemTableRow[] }) {
  const queryClient = useQueryClient();
  const [selectedItemId, setSelectedItemId] = React.useState<Pick<
    ItemTableRow,
    "item_id"
  > | null>(null);
  const [dialogType, setDialogType] = React.useState<
    "archive" | "restore" | null
  >(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const supabase = React.useMemo(() => createClient(), []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["user_inv_items", searchTerm, selectedCategory],
    queryFn: async ({ pageParam = 1 }) => {
      const userId = await getUserId();
      const showArchived = true;
      const response = await fetchItemsView(supabase, {
        userId,
        page: pageParam,
        includeArchived: showArchived,
        searchTerm,
        categoryId: selectedCategory,
      });
      return {
        data: response.data,
        nextPage: response.data.length === 10 ? pageParam + 1 : 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage || undefined,
    initialData: !searchTerm && !selectedCategory ? {
      pages: [{ data: initialItems, nextPage: 2 }],
      pageParams: [1],
    } : undefined,
    initialPageParam: 1,
  });

  const allItems = React.useMemo(() => {
    const items = data?.pages.flatMap((page) => page.data) ?? [];
    // Create a Map to store unique items by item_id
    const uniqueItems = new Map<string, ItemTableRow>();
    items.forEach((item) => {
      if (item.item_id) {
        uniqueItems.set(item.item_id, item);
      }
    });
    return Array.from(uniqueItems.values());
  }, [data]);

  const handleSearch = React.useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleCategoryChange = React.useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleArchive = async () => {
    if (!selectedItemId?.item_id) return;
    await archiveItem(supabase, selectedItemId.item_id);
    queryClient.invalidateQueries({ queryKey: ["user_inv_items"] });
    setDialogType(null);
  };

  const handleRestore = async () => {
    if (!selectedItemId?.item_id) return;
    await restoreItem(supabase, selectedItemId.item_id);
    queryClient.invalidateQueries({ queryKey: ["user_inv_items"] });
    setDialogType(null);
  };

  const columns = useItemsColumns({
    onArchive: (item) => {
      if (item.item_id) {
        setSelectedItemId({ item_id: item.item_id });
        setDialogType("archive");
      }
    },
    onRestore: (item) => {
      if (item.item_id) {
        setSelectedItemId({ item_id: item.item_id });
        setDialogType("restore");
      }
    },
  });

  return (
    <>
      <DataTable
        columns={columns}
        data={allItems}
        actions={<CreateItemDialog />}
        searchPlaceholder="Search items..."
        enableRowSelection={false}
        searchColumn="item_name"
        idKey="item_id"
        onRowClick={(item) =>
          setSelectedItemId(item.item_id ? { item_id: item.item_id } : null)
        }
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        onSearch={handleSearch}
        filterComponent={<CategoryFilter onCategoryChange={handleCategoryChange} />}
      />

      <ItemDetailsSheet
        itemId={selectedItemId}
        open={!!selectedItemId}
        onOpenChange={(open) => !open && setSelectedItemId(null)}
      />

      <ArchiveDialog
        isOpen={dialogType === "archive"}
        onOpenChange={(open) => !open && setDialogType(null)}
        selectedItem={{ item_id: selectedItemId?.item_id || "" }}
        onArchive={handleArchive}
        queryKey={["user_inv_items"]}
      />

      <RestoreDialog
        isOpen={dialogType === "restore"}
        onOpenChange={(open) => !open && setDialogType(null)}
        selectedItem={{ item_id: selectedItemId?.item_id || "" }}
        onRestore={handleRestore}
        queryKey={["user_inv_items"]}
      />
    </>
  );
}
