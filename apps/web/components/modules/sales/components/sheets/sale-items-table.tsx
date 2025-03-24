import { type ColumnDef } from "@tanstack/react-table";
import { Sale } from "@synq/supabase/types";
import { DataTable } from "@ui/shared/components/data-table/data-table";
import { useSaleItemsColumns } from "../../hooks/use-sales-items-columns";

interface SaleItemsTableProps {
  items: Sale["items"];
}

export function SaleItemsTable({ items }: SaleItemsTableProps) {
  const columns: ColumnDef<Sale["items"][0]>[] = useSaleItemsColumns({
    onDelete: () => {},
    selectedSales: new Set(),
    onSelectSale: () => {},
    onSelectAll: () => {}
  });

  return (
    <DataTable
      columns={columns}
      data={items || []}
      enableRowSelection={false}
      searchPlaceholder="Search items..."
    />
  );
}
