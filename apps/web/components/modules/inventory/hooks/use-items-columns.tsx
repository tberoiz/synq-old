import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@synq/ui/button";
import { MoreVertical, Archive, RefreshCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@synq/ui/dropdown-menu";
import ArchiveStatusBadge from "@ui/shared/badges/archived-status-badge";
import { ItemTableRow } from "@synq/supabase/types";

export function useItemsColumns({
  onArchive,
  onRestore,
}: {
  onArchive: (item: ItemTableRow) => void;
  onRestore: (item: ItemTableRow) => void;
}) {
  return useMemo(
    () =>
      [
        {
          accessorKey: "item_name",
          header: () => <div className="w-[35%]">Name</div>,
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <span className="font-medium">{row.getValue("item_name")}</span>
            </div>
          ),
        },
        {
          accessorKey: "sku",
          header: () => <div className="w-24">SKU</div>,
          cell: ({ row }) => (
            <p className="w-24 truncate">{row.getValue("sku")}</p>
          ),
        },
        {
          accessorKey: "category",
          header: () => <div className="w-28">Category</div>,
          cell: ({ row }) => (
            <div className="w-28 truncate">{row.getValue("category")}</div>
          ),
        },
        {
          accessorKey: "listing_price",
          header: () => <div className="w-16 text-right">Price</div>,
          cell: ({ row }) => (
            <div className="w-16 text-right">
              ${row.getValue("listing_price")}
            </div>
          ),
        },
        {
          id: "inventory",
          header: () => <span className="w-28 text-center">Stock</span>,
          cell: ({ row }) => (
            <span className="w-28 text-center text-primary">
              {row.original.total_quantity ?? 0}
            </span>
          ),
        },
        {
          accessorKey: "is_archived",
          header: () => <span className=" text-center">Status</span>,
          cell: ({ row }) => (
            <div className="flex justify-center">
              <ArchiveStatusBadge
                isArchived={row.original.is_archived ?? false}
              />
            </div>
          ),
        },
        {
          id: "actions",
          cell: ({ row }) => (
            <ActionsCell
              item={row.original}
              onArchive={onArchive}
              onRestore={onRestore}
            />
          ),
        },
      ] as ColumnDef<ItemTableRow>[],
    [onArchive, onRestore],
  );
}

const ActionsCell = ({
  item,
  onArchive,
  onRestore,
}: {
  item: ItemTableRow;
  onArchive: (item: ItemTableRow) => void;
  onRestore: (item: ItemTableRow) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <span className="sr-only">Open menu</span>
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {item.is_archived ? (
        <DropdownMenuItem onClick={() => onRestore(item)}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Restore
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem onClick={() => onArchive(item)}>
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);
