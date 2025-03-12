import * as React from "react";
import {
  type Table as TanstackTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableHero } from "./data-table-hero";
import { DataTableHeader } from "./data-table-header";
import { DataTableBody } from "./data-table-body";
import { Table } from "@synq/ui/table";
import isEqual from "fast-deep-equal";

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  enableRowSelection?: boolean;
  selectedRows?: TData[];
  onRowSelectionChange?: (rows: TData[]) => void;
  searchColumn?: string;
  onRowClick?: (row: TData) => void;
  idKey?: string;
}

function useTableState() {
  return {
    sorting: React.useState<SortingState>([]),
    columnFilters: React.useState<ColumnFiltersState>([]),
    columnVisibility: React.useState<VisibilityState>({}),
    rowSelection: React.useState<Record<string, boolean>>({}),
  };
}

export function DataTable<TData>({
  columns,
  data,
  actions,
  searchPlaceholder = "Search...",
  enableRowSelection = false,
  selectedRows = [],
  onRowSelectionChange,
  searchColumn = "name",
  onRowClick,
  idKey = "id",
}: DataTableProps<TData>) {
  const {
    sorting: [sorting, setSorting],
    columnFilters: [columnFilters, setColumnFilters],
    columnVisibility: [columnVisibility, setColumnVisibility],
    rowSelection: [rowSelection, setRowSelection],
  } = useTableState();

  const previousSelectedRows = React.useRef<TData[]>(selectedRows);

  const initialRowSelection = React.useMemo(() => {
    return enableRowSelection
      ? Object.fromEntries(
          selectedRows.map((row) => [(row as any)[idKey], true])
        )
      : {};
  }, [enableRowSelection, selectedRows, idKey]);

  const tableState = React.useMemo(
    () => ({
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: enableRowSelection ? rowSelection : {},
    }),
    [sorting, columnFilters, columnVisibility, rowSelection, enableRowSelection]
  );

  const tableOptions = React.useMemo(
    () => ({
      data,
      columns,
      state: tableState,
      enableRowSelection,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      initialState: {
        pagination: { pageSize: 10 },
        rowSelection: initialRowSelection,
      },
      getRowId: (row: TData) => {
        const id = (row as any)[idKey];
        if (id === undefined) {
          console.warn(`Row ID key "${idKey}" not found in row:`, row);
        }
        return id;
      },
    }),
    [
      data,
      columns,
      tableState,
      enableRowSelection,
      setSorting,
      setColumnFilters,
      setColumnVisibility,
      setRowSelection,
      initialRowSelection,
      idKey,
    ]
  );

  const table = useReactTable(tableOptions);

  React.useEffect(() => {
    if (!onRowSelectionChange) return;

    const selectedData = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    
    if (!isEqual(previousSelectedRows.current, selectedData)) {
      previousSelectedRows.current = selectedData;
      onRowSelectionChange(selectedData);
    }
  }, [rowSelection, onRowSelectionChange, table]);

  React.useEffect(() => {
    if (!enableRowSelection) return;

    const newRowSelection = Object.fromEntries(
      selectedRows.map((row) => [(row as any)[idKey], true])
    );

    if (!isEqual(newRowSelection, rowSelection)) {
      setRowSelection(newRowSelection);
    }
  }, [selectedRows, enableRowSelection, idKey]);

  const tableHero = React.useMemo(() => (
    <DataTableHero
      table={table}
      searchPlaceholder={searchPlaceholder}
      actions={actions}
      searchColumn={searchColumn}
    />
  ), [table, searchPlaceholder, actions, searchColumn]);

  const tableContent = React.useMemo(() => (
    <Table>
      <DataTableHeader table={table} />
      <DataTableBody
        table={table}
        columns={columns}
        onRowClick={onRowClick}
      />
    </Table>
  ), [table, columns, onRowClick]);

  const tablePagination = React.useMemo(() => (
    <DataTablePagination table={table} />
  ), [table]);

  return (
    <>
      {tableHero}
      {tableContent}
      {tablePagination}
    </>
  );
}
