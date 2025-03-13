"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";

// External
import { DataTable } from "@ui/shared/data-table/data-table";
import { createClient } from "@synq/supabase/client";
import { archiveItem, restoreItem } from "@synq/supabase/queries";

// Internal Components
import { CreateItemDialog } from "../dialogs/create-item-dialog";
import { ArchiveDialog } from "@ui/shared/dialogs/archive-dialog";
import { RestoreDialog } from "@ui/shared/dialogs/restore-dialog";

import ItemDetailsSheet from "../sheets/item-details-sheet";

// Columns
import { useItemsColumns } from "@ui/modules/inventory/hooks/use-items-columns";
// Types
import { ItemTableRow } from "@synq/supabase/types";

export function ItemsTableClient({ items }: { items: ItemTableRow[] }) {
  const queryClient = useQueryClient();
  const [selectedItemId, setSelectedItemId] = React.useState<Pick<
    ItemTableRow,
    "item_id"
  > | null>(null);
  const [dialogType, setDialogType] = React.useState<
    "archive" | "restore" | null
  >(null);
  const supabase = React.useMemo(() => createClient(), []);

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
        data={items}
        actions={<CreateItemDialog />}
        searchPlaceholder="Search items..."
        enableRowSelection={false}
        searchColumn="item_name"
        idKey="item_id"
        onRowClick={(item) =>
          setSelectedItemId(item.item_id ? { item_id: item.item_id } : null)
        }
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
