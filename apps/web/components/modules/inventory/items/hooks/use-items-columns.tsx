"use client";

// Core
import { useMemo } from "react";

// Types
import { ItemTableRow } from "@synq/supabase/types";
import { type ColumnDef } from "@tanstack/react-table";

// Components
import { Button } from "@synq/ui/button";
import {
  Archive,
  RefreshCcw,
  Tag,
  Hash,
  DollarSign,
  FolderTree,
  Boxes,
  Archive as ArchiveIcon,
  ShoppingCart,
  PackageX,
} from "lucide-react";
import { cn } from "@synq/ui/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@synq/ui/tooltip";

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
          header: () => (
            <div className="flex items-center gap-2 text-muted-foreground min-w-[200px] max-w-[300px]">
              <Boxes className="h-4 w-4" />
              <span>Name</span>
            </div>
          ),
          cell: ({ row }) => {
            const isArchived = row.original.is_archived;

            return (
              <div
                className={cn(
                  "flex items-center gap-2 min-w-[200px] max-w-[300px]",
                  isArchived && "opacity-60"
                )}
              >
                {isArchived ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onRestore(row.original);
                          }}
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p>Restore Item</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onArchive(row.original);
                          }}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p>Archive Item</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-medium",
                      isArchived && "text-muted-foreground"
                    )}
                  >
                    {row.getValue("item_name")}
                  </span>
                  {isArchived && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium">
                      <ArchiveIcon className="h-3 w-3" />
                      <span>Archived</span>
                    </div>
                  )}
                </div>
              </div>
            );
          },
        },
        {
          id: "remaining",
          header: () => (
            <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[100px] max-w-[120px]">
              <PackageX className="h-4 w-4" />
              <span>Stock</span>
            </div>
          ),
          cell: ({ row }) => {
            const totalQuantity = row.original.total_quantity ?? 0;
            const remaining = totalQuantity - (row.original.total_sold ?? 0);

            return (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center gap-2 cursor-help min-w-[100px] max-w-[120px]">
                      <PackageX
                        className={cn(
                          "h-4 w-4",
                          remaining === 0
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                      />
                      {remaining === 0 ? (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                          <span>Out of Stock</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              "font-medium",
                              remaining < 10 && "text-warning"
                            )}
                          >
                            {remaining}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / {totalQuantity}
                          </span>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <div className="flex flex-col gap-1">
                      <p>Remaining: {remaining}</p>
                      <p>Total Sold: {row.original.total_sold ?? 0}</p>
                      <p>Total Quantity: {totalQuantity}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          },
        },
        {
          accessorKey: "listing_price",
          header: () => (
            <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[80px] max-w-[100px]">
              <DollarSign className="h-4 w-4" />
              <span>Price</span>
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex items-center justify-center min-w-[80px] max-w-[100px]">
              ${row.original.listing_price.toFixed(2)}
            </div>
          ),
        },
        {
          id: "sold",
          header: () => (
            <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[80px] max-w-[100px]">
              <ShoppingCart className="h-4 w-4" />
              <span>Sold</span>
            </div>
          ),
          cell: ({ row }) => {
            const totalSold = row.original.total_sold ?? 0;

            return (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center gap-2 cursor-help min-w-[80px] max-w-[100px]">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-muted-foreground">
                        {totalSold}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p>Total Items Sold</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          },
        },
        {
          id: "sku",
          header: () => (
            <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[100px] max-w-[120px]">
              <Hash className="h-4 w-4" />
              <span>SKU</span>
            </div>
          ),
          cell: ({ row }) => (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center cursor-help min-w-[100px] max-w-[120px]">
                    <span className="text-primary truncate">
                      {row.original.sku ?? "-"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>Stock Keeping Unit</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ),
        },
        {
          accessorKey: "category",
          header: () => (
            <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[120px] max-w-[150px]">
              <FolderTree className="h-4 w-4" />
              <span>Category</span>
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex items-center justify-center gap-1.5 min-w-[120px] max-w-[150px]">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{row.getValue("category")}</span>
            </div>
          ),
        },
      ] as ColumnDef<ItemTableRow>[],
    [onArchive, onRestore]
  );
}
