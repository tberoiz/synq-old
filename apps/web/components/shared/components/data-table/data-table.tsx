// Components
import { Table } from "@synq/ui/table";
import { CircularSpinner } from "@ui/shared/components/spinners/circular-spinner";
import { DataTableFilters } from "./data-table-filters";
import { DataTableHeader } from "./data-table-header";
import { DataTableBody } from "./data-table-body";

// API and third-party libraries
import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useInView } from "react-intersection-observer";

// Internal utilities
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
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onSearch?: (term: string) => void;
  filterComponent?: React.ReactNode;
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
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onSearch,
  filterComponent,
}: DataTableProps<TData>) {
  const {
    sorting: [sorting, setSorting],
    columnFilters: [columnFilters, setColumnFilters],
    columnVisibility: [columnVisibility, setColumnVisibility],
    rowSelection: [rowSelection, setRowSelection],
  } = useTableState();

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const previousSelectedRows = React.useRef<TData[]>(selectedRows);

  const initialRowSelection = React.useMemo(() => {
    return enableRowSelection
      ? Object.fromEntries(
          selectedRows.map((row) => [(row as any)[idKey], true]),
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
    [
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      enableRowSelection,
    ],
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
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      initialState: {
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
    ],
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
      selectedRows.map((row) => [(row as any)[idKey], true]),
    );

    if (!isEqual(newRowSelection, rowSelection)) {
      setRowSelection(newRowSelection);
    }
  }, [selectedRows, enableRowSelection, idKey]);

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasNextPage, isFetchingNextPage, onLoadMore]);

  const tableHero = React.useMemo(
    () => (
      <DataTableFilters
        table={table}
        searchPlaceholder={searchPlaceholder}
        actions={actions}
        searchColumn={searchColumn}
        onSearch={onSearch}
        filterComponent={filterComponent}
      />
    ),
    [table, searchPlaceholder, actions, searchColumn, onSearch, filterComponent],
  );

  return (
    <div>
      {tableHero}
      <div className="rounded-md border">
        <div className="relative overflow-x-auto">
          <Table>
            <DataTableHeader table={table} />
            <DataTableBody
              table={table}
              columns={columns}
              onRowClick={onRowClick}
            />
          </Table>
        </div>
      </div>
      <div ref={ref} className="h-4 w-full">
        {isFetchingNextPage && (
          <div className="py-4">
            <CircularSpinner size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
