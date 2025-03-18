import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Archive, RefreshCcw } from "lucide-react";
import { Button } from "@synq/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@synq/ui/dropdown-menu";
import { Badge } from "@synq/ui/badge";
import { format } from "date-fns";
import { cn } from "@synq/ui/utils";
import { type PurchaseTableRow } from "@synq/supabase/types";

interface UsePurchaseColumnsProps {
  onViewDetails: (purchase: PurchaseTableRow) => void;
  onArchive: (purchase: PurchaseTableRow) => void;
  onRestore: (purchase: PurchaseTableRow) => void;
}

export function usePurchaseColumns({
  onViewDetails,
  onArchive,
  onRestore,
}: UsePurchaseColumnsProps) {
  return useMemo(
    () =>
      [
        {
          accessorKey: "name",
          header: () => <div className="w-[20%]">Name</div>,
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <span className="font-medium">{row.getValue("name")}</span>
            </div>
          ),
        },
        {
          accessorKey: "created_at",
          header: "Date",
          cell: ({ row }) => (
            <div>{format(new Date(row.original.created_at), "MMM dd, yyyy")}</div>
          ),
        },
        {
          accessorKey: "total_cost",
          header: "Total Cost",
          cell: ({ row }) => <div>${row.original.total_cost?.toFixed(2)}</div>,
        },
        {
          accessorKey: "potential_revenue",
          header: "Potential Revenue",
          cell: ({ row }) => <div>${row.original.potential_revenue?.toFixed(2)}</div>,
        },
        {
          accessorKey: "actual_revenue",
          header: "Actual Revenue",
          cell: ({ row }) => <div>${row.original.actual_revenue?.toFixed(2)}</div>,
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => (
            <Badge
              variant="secondary"
              className={cn(
                row.original.status === "active" &&
                  "bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-950/20 dark:text-green-300",
                row.original.status === "archived" &&
                  "bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-950/20 dark:text-red-300",
              )}
            >
              {row.original.status === "archived" ? "Archived" : "Active"}
            </Badge>
          ),
        },
        {
          id: "actions",
          cell: ({ row }) => {
            const purchase = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails(purchase)}>
                    View details
                  </DropdownMenuItem>
                  {purchase.status === "archived" ? (
                    <DropdownMenuItem onClick={() => onRestore(purchase)}>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Restore
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onArchive(purchase)}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
      ] as ColumnDef<PurchaseTableRow>[],
    [onViewDetails, onArchive, onRestore],
  );
}
