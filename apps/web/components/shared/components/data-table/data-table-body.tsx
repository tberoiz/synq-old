import type { ColumnDef, Table } from "@tanstack/react-table";
import { TableBody, TableCell, TableRow } from "@synq/ui/table";
import { flexRender } from "@tanstack/react-table";
import { CircularSpinner } from "@ui/shared/components/spinners/circular-spinner";

interface DataTableBodyProps<TData> {
  table: Table<TData>;
  columns: ColumnDef<TData>[];
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
}

export function DataTableBody<TData>({
  table,
  columns,
  onRowClick,
  isLoading,
}: DataTableBodyProps<TData>) {
  if (isLoading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            <div className="flex items-center justify-center gap-2">
              <CircularSpinner size="sm" />
              <span>Loading...</span>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

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
