import { type ColumnDef } from "@tanstack/react-table";
import { Sale } from "@synq/supabase/types";
import { DataTable } from "@ui/shared/data-table/data-table";

interface SaleItemsTableProps {
  items: Sale["items"];
}

export function SaleItemsTable({ items }: SaleItemsTableProps) {
  const columns: ColumnDef<Sale["items"][0]>[] = [
    {
      accessorKey: "name",
      header: "Item",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => (
        <div className="text-right">{row.original.quantity}</div>
      ),
    },
    {
      accessorKey: "unit_price",
      header: "Unit Price",
      cell: ({ row }) => (
        <div className="text-right">${row.original.unit_price.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "total_price",
      header: "Total Price",
      cell: ({ row }) => (
        <div className="text-right">${row.original.total_price.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "total_cost",
      header: "COGS",
      cell: ({ row }) => (
        <div className="text-right">${row.original.total_cost.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "profit",
      header: "Profit",
      cell: ({ row }) => (
        <div className="text-right">${row.original.profit.toFixed(2)}</div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={items || []}      
      enableRowSelection={false}
      searchPlaceholder="Search items..."
    />
  );
}
