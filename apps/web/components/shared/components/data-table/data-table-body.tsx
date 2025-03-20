import type { ColumnDef, Table } from "@tanstack/react-table";
import { TableBody, TableCell, TableRow } from "@synq/ui/table";
import { flexRender } from "@tanstack/react-table";

interface DataTableBodyProps<TData> {
  table: Table<TData>;
  columns: ColumnDef<TData>[];
  onRowClick?: (row: TData) => void;
}

export function DataTableBody<TData>({
  table,
  columns,
  onRowClick,
}: DataTableBodyProps<TData>) {
  return (
    <TableBody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            className="bg-muted/50 hover:bg-muted/80 cursor-pointer"
            onClick={() => onRowClick?.(row.original)}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
