import { type ColumnDef } from "@tanstack/react-table";
import { SaleTableRow } from "@synq/supabase/types";
import { CheckCircle2Icon, ClockIcon, Trash2 } from "lucide-react";
import { Badge } from "@synq/ui/badge";
import { cn } from "@synq/ui/utils";
import { format } from "date-fns";
import { Checkbox } from "@synq/ui/checkbox";
import { Button } from "@synq/ui/button";

interface UseSaleColumnsProps {
  onDelete?: (saleId: string) => void;
}

export function useSaleColumns({ onDelete }: UseSaleColumnsProps = {}) {
  const columns: ColumnDef<SaleTableRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusConfig = {
          listed: {
            icon: ClockIcon,
            className:
              "bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-950/20 dark:text-blue-300",
          },
          completed: {
            icon: CheckCircle2Icon,
            className:
              "bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-950/20 dark:text-green-300",
          },
          cancelled: {
            icon: ClockIcon,
            className:
              "bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-950/20 dark:text-red-300",
          },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config.icon;

        return (
          <Badge variant="secondary" className={cn(config.className)}>
            <Icon className="mr-1 h-3 w-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "sale_date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("sale_date"));
        return format(date, "MMM dd, yyyy");
      },
    },
    {
      accessorKey: "total_items",
      header: () => <div className="text-right">Items</div>,
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("total_items")}</div>
      ),
    },
    {
      accessorKey: "total_cogs",
      header: () => <div className="text-right">COGS</div>,
      cell: ({ row }) => {
        const cogs = row.getValue("total_cogs") as number;
        return <div className="text-right">${cogs.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "net_profit",
      header: () => <div className="text-right">Profit</div>,
      cell: ({ row }) => {
        const profit = row.getValue("net_profit") as number;
        return (
          <div
            className={cn(
              "text-right",
              profit > 0 ? "text-green-500" : "text-muted-foreground"
            )}
          >
            ${profit.toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: "platform",
      header: "Platform",
      cell: ({ row }) => {
        const platform = row.getValue("platform") as string;
        return platform.charAt(0).toUpperCase() + platform.slice(1);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(row.original.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        );
      },
    },
  ];

  return columns;
}
