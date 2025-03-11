"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@synq/ui/badge";
import { ClockIcon, CheckCircle2Icon } from "lucide-react";
import { format } from "date-fns";
import { Sale } from "@synq/supabase/types";
import { cn } from "@synq/ui/utils";
import { Sheet } from "@synq/ui/sheet";
import { CreateSaleDialog } from "@ui/modules/sales/components/dialogs/create-sale-dialog";
import SaleDetailsSheet from "@ui/modules/sales/components/sheets/sale-details-sheet";
import { DataTable } from "@ui/shared/data-table/data-table";

export const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant="secondary"
          className={cn(
            status === "listed" &&
              "bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-950/20 dark:text-blue-300",
            status === "completed" &&
              "bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-950/20 dark:text-green-300",
            status === "cancelled" &&
              "bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-950/20 dark:text-red-300",
          )}
        >
          {status === "listed" ? (
            <ClockIcon className="mr-1 h-3 w-3" />
          ) : status === "completed" ? (
            <CheckCircle2Icon className="mr-1 h-3 w-3" />
          ) : (
            <ClockIcon className="mr-1 h-3 w-3" />
          )}
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
            profit > 0 ? "text-green-500" : "text-muted-foreground",
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
];

interface SalesTransactionsTableProps {
  data: Sale[];
}

export function SalesTransactionsTable({
  data,
}: SalesTransactionsTableProps) {
  const [selectedSale, setSelectedSale] = React.useState<Sale | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        defaultPageSize={10}
        searchPlaceholder="Filter sales..."
        searchColumn="sale_date"
        onRowClick={setSelectedSale}
        actions={<CreateSaleDialog />}
      />

      <Sheet
        open={!!selectedSale}
        onOpenChange={(open: boolean) => !open && setSelectedSale(null)}
      >
        <SaleDetailsSheet
          sale={selectedSale}
          isMobile={isMobile}
          onOpenChange={(open: boolean) => !open && setSelectedSale(null)}
        />
      </Sheet>
    </>
  );
}
