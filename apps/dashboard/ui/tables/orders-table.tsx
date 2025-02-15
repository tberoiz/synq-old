"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@synq/ui/button";
import { Checkbox } from "@synq/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@synq/ui/dropdown-menu";
import { Input } from "@synq/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import Image from "next/image";
import { Badge } from "@synq/ui/badge";

const data: Order[] = [
  {
    id: "m5gr84i9",
    amount: 316,
    provider: "TCGPlayer",
    email: "ken99@yahoo.com",
    status: "delivered",
    date: "2024-03-15",
    channel: "TCGPlayer",
    items: [
      { id: "1", name: "Charizard Holo", quantity: 2 },
      { id: "2", name: "Blastoise EX", quantity: 1 },
    ],
  },
  {
    id: "3u1reuv4",
    amount: 242,
    provider: "CardMarket",
    email: "Abe45@gmail.com",
    status: "processing",
    date: "2024-03-14",
    channel: "CardMarket",
    items: [
      { id: "3", name: "Pikachu VMAX", quantity: 3 },
      { id: "4", name: "Mewtwo GX", quantity: 1 },
    ],
  },
  {
    id: "derv1ws0",
    amount: 837,
    provider: "Shopify",
    email: "Monserrat44@gmail.com",
    status: "shipped",
    date: "2024-03-13",
    channel: "Shopify",
    items: [
      { id: "5", name: "Lugia Legend", quantity: 1 },
      { id: "6", name: "Rayquaza EX", quantity: 2 },
    ],
  },
  {
    id: "5kma53ae",
    amount: 874,
    provider: "Ebay",
    email: "Silas22@gmail.com",
    status: "pending",
    date: "2024-03-12",
    channel: "Ebay",
    items: [
      { id: "7", name: "Gengar VMAX", quantity: 1 },
      { id: "8", name: "Umbreon GX", quantity: 2 },
    ],
  },
  {
    id: "cmk90876",
    amount: 310,
    provider: "CardMarket",
    email: "sophia.cm@gmail.com",
    status: "shipped",
    date: "2024-03-10",
    channel: "CardMarket",
    items: [
      { id: "11", name: "Sylveon V", quantity: 2 },
      { id: "12", name: "Espeon GX", quantity: 1 },
    ],
  },
];

export type Order = {
  id: string;
  amount: number;
  provider: "Ebay" | "Shopify" | "CardMarket" | "TCGPlayer";
  email: string;
  status: "pending" | "processing" | "shipped" | "delivered";
  date: string;
  channel: string;
  items: {
    id: string;
    name: string;
    quantity: number;
  }[];
};

export const columns: ColumnDef<Order>[] = [
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
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => {
      const channel = row.getValue("channel") as string;
      return (
        <div className="flex items-center justify-center gap-2">
          <Image
            src={`/icons/${channel.toLowerCase()}.svg`}
            width={24}
            height={24}
            alt={channel}
            className="h-6 w-6"
          />
          <span className="font-medium">{channel}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusColors;
      const statusColors = {
        delivered: "bg-green-500",
        shipped: "bg-blue-500",
        processing: "bg-yellow-500",
        pending: "bg-gray-500",
      };

      return (
        <Badge
          className={`${statusColors[status]} hover:${statusColors[status]} text-white`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "updatedItems",
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items;
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

      return <span className="font-medium text-primary">{totalQuantity}</span>;
    },
  },
  {
    accessorKey: "email",
    header: "Customer",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "date",
    header: "Order Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return (
        <div className="text-muted-foreground">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const order = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.id)}
            >
              Copy Order ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Customer</DropdownMenuItem>
            <DropdownMenuItem>View Order Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function OrdersTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter customers..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-center">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="text-center"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
