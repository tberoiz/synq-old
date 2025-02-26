"use client";

import * as React from "react";
import { UserItem } from "@synq/supabase/models/inventory";
import { DataTable } from "../data-table";
import { Checkbox } from "@synq/ui/checkbox";
import { ItemRowSettingsButton } from "@ui/buttons/items-row-settings-button";
import { ItemsTable } from "../../tables/inventory/items-table";

interface ItemsDataTableProps {
  data: UserItem[];
  loading: boolean;
  actions?: React.ReactNode;
  onSelectionChange?: (selectedItems: UserItem[]) => void;
}

interface Row {
  getValue: (key: string) => any;
  original: UserItem;
}

function ItemsDataTable({
  data,
  loading,
  actions,
  onSelectionChange,
}: ItemsDataTableProps) {
  const [selectedItems, setSelectedItems] = React.useState<UserItem[]>([]);

  const handleRowSelectionChange = (rows: UserItem[]) => {
    setSelectedItems(rows);
    if (onSelectionChange) {
      onSelectionChange(rows);
    }
  };

  const itemColumns = [
    {
      id: "select",
      header: ({ table }: { table: any }) => (
        <Checkbox
          checked={
            selectedItems.length === table.getRowModel().rows.length &&
            table.getRowModel().rows.length > 0
          }
          onCheckedChange={(value: boolean) => {
            const newSelectedItems = value
              ? table.getRowModel().rows.map((row: Row) => row.original)
              : [];
            setSelectedItems(newSelectedItems);
            if (onSelectionChange) {
              onSelectionChange(newSelectedItems);
            }
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: Row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedItems.some((i) => i.id === row.original.id)}
            onCheckedChange={() => {
              const newSelectedItems = selectedItems.some(
                (i) => i.id === row.original.id
              )
                ? selectedItems.filter((i) => i.id !== row.original.id)
                : [...selectedItems, row.original];
              setSelectedItems(newSelectedItems);
              if (onSelectionChange) {
                onSelectionChange(newSelectedItems);
              }
            }}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Item Name",
      cell: ({ row }: { row: Row }) => {
        return <span className="font-medium">{row.original.name}</span>;
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }: { row: Row }) => (
        <span className="text-center">{row.getValue("quantity")}</span>
      ),
    },
    {
      accessorKey: "cogs",
      header: "COGS (Cost)",
      cell: ({ row }: { row: Row }) => {
        const cogs = parseFloat(row.getValue("cogs")) || 0;
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(cogs);
      },
    },
    {
      accessorKey: "listing_price",
      header: "Selling Price",
      cell: ({ row }: { row: Row }) => {
        const price = parseFloat(row.getValue("listing_price")) || 0;
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price);
      },
    },
    {
      accessorKey: "profit",
      header: "Profit",
      cell: ({ row }: { row: Row }) => {
        const cogs = parseFloat(row.getValue("cogs")) || 0;
        const price = parseFloat(row.getValue("listing_price")) || 0;
        const profit = price - cogs;
        return (
          <span className={profit >= 0 ? "text-green-500" : "text-red-500"}>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(profit)}
          </span>
        );
      },
    },
    {
      accessorKey: "Actions",
      header: "",
      cell: ({ row }: { row: Row }) => (
        <ItemRowSettingsButton itemId={row.original.id} />
      ),
    },
  ];

  return (
    <DataTable
      columns={itemColumns}
      data={data}
      actions={actions}
      searchPlaceholder="Search items..."
      tableComponent={(filteredData) => (
        <ItemsTable
          data={filteredData}
          selectedItems={selectedItems}
          onRowSelectionChange={handleRowSelectionChange}
        />
      )}
      enableRowSelection={true}
      selectedRows={selectedItems}
      onRowSelectionChange={handleRowSelectionChange}
    />
  );
}

export default ItemsDataTable;
