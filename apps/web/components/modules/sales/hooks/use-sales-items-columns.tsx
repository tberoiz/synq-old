import { Sale } from "@synq/supabase/types";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { Boxes, Hash, DollarSign, ShoppingCart } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@synq/ui/tooltip";

interface UseSalesColumnProps {
  onDelete: (sale: Sale["items"][0]) => void;
  selectedSales: Set<string>;
  onSelectSale: (saleId: string) => void;
  onSelectAll: () => void;
}

export function useSaleItemsColumns({
  onDelete,
  selectedSales,
  onSelectSale,
  onSelectAll
}: UseSalesColumnProps): ColumnDef<Sale["items"][0]>[] {
  return useMemo(() => [
    {
      accessorKey: "name",
      header: () => (
        <div className="flex items-center gap-2 text-muted-foreground min-w-[200px] max-w-[300px]">
          <Boxes className="h-4 w-4" />
          <span>Item</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-[200px] max-w-[300px]">
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.original.name}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "sku",
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
                <span className="text-primary truncate">{row.original.sku || "-"}</span>
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
      accessorKey: "quantity",
      header: () => (
        <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[80px] max-w-[100px]">
          <ShoppingCart className="h-4 w-4" />
          <span>Quantity</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center min-w-[80px] max-w-[100px]">
          <span className="font-medium">{row.original.quantity}</span>
        </div>
      ),
    },
    {
      accessorKey: "unit_price",
      header: () => (
        <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[80px] max-w-[100px]">
          <DollarSign className="h-4 w-4" />
          <span>Unit Price</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center min-w-[80px] max-w-[100px]">
          ${row.original.unit_price.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "total_price",
      header: () => (
        <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[80px] max-w-[100px]">
          <DollarSign className="h-4 w-4" />
          <span>Total Price</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center min-w-[80px] max-w-[100px]">
          ${row.original.total_price.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "total_cost",
      header: () => (
        <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[80px] max-w-[100px]">
          <DollarSign className="h-4 w-4" />
          <span>COGS</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center min-w-[80px] max-w-[100px]">
          ${row.original.total_cost.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "profit",
      header: () => (
        <div className="flex items-center justify-center gap-2 text-muted-foreground min-w-[80px] max-w-[100px]">
          <DollarSign className="h-4 w-4" />
          <span>Profit</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center min-w-[80px] max-w-[100px]">
          ${row.original.profit.toFixed(2)}
        </div>
      ),
    },
  ],
  [onDelete, selectedSales, onSelectSale, onSelectAll]);
}
