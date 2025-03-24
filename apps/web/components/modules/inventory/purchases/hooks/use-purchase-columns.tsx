// Components
import { Button } from "@synq/ui/button";
import { Badge } from "@synq/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@synq/ui/tooltip";

// API and third-party libraries
import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Archive, RefreshCcw, Package, Calendar, DollarSign, TrendingUp, LineChart, Tag } from "lucide-react";
import { format } from "date-fns";

// Internal utilities
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
          header: () => (
            <div className="flex items-center gap-2 text-muted-foreground min-w-[200px] max-w-[300px]">
              <Package className="h-4 w-4" />
              <span>Name</span>
            </div>
          ),
          cell: ({ row }) => {
            const purchase = row.original;
            const isArchived = purchase.status === "archived";

            return (
              <div className="flex items-center gap-2 min-w-[200px] max-w-[300px]">
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
                            onRestore(purchase);
                          }}
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p>Restore Purchase</p>
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
                            onArchive(purchase);
                          }}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p>Archive Purchase</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <div className="flex items-center gap-2">
                  <span 
                    className={cn(
                      "font-medium truncate",
                      isArchived && "text-muted-foreground"
                    )}
                    onClick={() => onViewDetails(purchase)}
                  >
                    {row.getValue("name")}
                  </span>
                  {isArchived && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium">
                      <Archive className="h-3 w-3" />
                      <span>Archived</span>
                    </div>
                  )}
                </div>
              </div>
            );
          },
        },
        {
          accessorKey: "created_at",
          header: () => (
            <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[100px] max-w-[120px]">
              <Calendar className="h-4 w-4" />
              <span>Date</span>
            </div>
          ),
          cell: ({ row }) => (
            <div className="text-center min-w-[100px] max-w-[120px]">{format(new Date(row.original.created_at), "MMM dd, yyyy")}</div>
          ),
        },
        {
          accessorKey: "total_cost",
          header: () => (
            <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[100px] max-w-[120px]">
              <DollarSign className="h-4 w-4" />
              <span>Total Cost</span>
            </div>
          ),
          cell: ({ row }) => <div className="text-center min-w-[100px] max-w-[120px]">${row.original.total_cost?.toFixed(2)}</div>,
        },
        {
          accessorKey: "potential_revenue",
          header: () => (
            <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[120px] max-w-[150px]">
              <TrendingUp className="h-4 w-4" />
              <span>Potential Revenue</span>
            </div>
          ),
          cell: ({ row }) => <div className="text-center min-w-[120px] max-w-[150px]">${row.original.potential_revenue?.toFixed(2)}</div>,
        },
        {
          accessorKey: "actual_revenue",
          header: () => (
            <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[120px] max-w-[150px]">
              <LineChart className="h-4 w-4" />
              <span>Actual Revenue</span>
            </div>
          ),
          cell: ({ row }) => <div className="text-center min-w-[120px] max-w-[150px]">${row.original.actual_revenue?.toFixed(2)}</div>,
        },
        {
          accessorKey: "status",
          header: () => (
            <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[100px] max-w-[120px]">
              <Tag className="h-4 w-4" />
              <span>Status</span>
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex justify-center min-w-[100px] max-w-[120px]">
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
            </div>
          ),
        },
      ] as ColumnDef<PurchaseTableRow>[],
    [onViewDetails, onArchive, onRestore],
  );
}
