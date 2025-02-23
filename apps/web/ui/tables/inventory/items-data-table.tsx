"use client";

import * as React from "react";
import { UserInventory } from "@synq/supabase/models/inventory";
import ItemDetailsSheetContent from "@ui/sheets/item-details-sheet";
import { DataTable } from "../data-table";
import { Checkbox } from "@synq/ui/checkbox";
import { ItemRowSettingsButton } from "@ui/dialogs/items-row-settings-button";
import { ItemsGrid } from "@ui/grids/inventory/items-grid";
import { ItemsTable } from "./item-table";

interface ItemsDataTableProps {
  data: UserInventory[];
  loading: boolean;
}

interface Row {
  getValue: (key: string) => any;
  original: UserInventory;
}

function ItemsDataTable({ data, loading }: ItemsDataTableProps) {
  const [selectedItems, setSelectedItems] = React.useState<UserInventory[]>([]);

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
            if (value) {
              setSelectedItems(
                table.getRowModel().rows.map((row: Row) => row.original),
              );
            } else {
              setSelectedItems([]);
            }
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: Row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedItems.some((i) => i.id === row.original.id)}
            onCheckedChange={() => handleSelectItem(row.original)}
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
        const customName = row.original.custom_name;
        const globalCardName = row.original.global_card?.name;
        const name = customName || globalCardName || "Unnamed Item";
        return <span className="font-medium">{name}</span>;
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

  const handleSelectItem = (item: UserInventory) => {
    setSelectedItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item],
    );
  };

  return (
    <DataTable
      columns={itemColumns}
      data={data}
      searchPlaceholder="Search items..."
      gridComponent={(filteredData) => (
        <ItemsGrid
          data={filteredData}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
        />
      )}
      tableComponent={(filteredData) => (
        <ItemsTable
          data={filteredData}
          onRowClick={(row: UserInventory) => (
            <ItemDetailsSheetContent item={row} />
          )}
        />
      )}
      enableRowSelection={true}
      selectedRows={selectedItems}
      onRowSelectionChange={setSelectedItems}
    />
  );
}
export default ItemsDataTable;
