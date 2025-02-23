"use client";

import * as React from "react";
import { UserCollection } from "@synq/supabase/models/inventory";
import { DataTable } from "../data-table";
import { Checkbox } from "@synq/ui/checkbox";
import { CollectionsRowSettingsButton } from "@ui/dialogs/collections-row-settings-button";
import { CollectionsGrid } from "@ui/grids/inventory/collections-grid";
import { CollectionDetailsSheetContent } from "@ui/sheets/collection-details-sheet";
import { CollectionsTable } from "./collections-table";

interface CollectionsDataTableProps {
  data: UserCollection[];
  loading: boolean;
}

interface Row {
  getValue: (key: string) => any;
  original: UserCollection;
}

function CollectionsDataTable({ data, loading }: CollectionsDataTableProps) {
  const [selectedCollections, setSelectedCollections] = React.useState<
    UserCollection[]
  >([]);

  const collectionColumns = [
    {
      id: "select",
      header: ({ table }: { table: any }) => (
        <Checkbox
          checked={
            selectedCollections.length === table.getRowModel().rows.length &&
            table.getRowModel().rows.length > 0
          }
          onCheckedChange={(value: boolean) => {
            if (value) {
              setSelectedCollections(
                table.getRowModel().rows.map((row: Row) => row.original),
              );
            } else {
              setSelectedCollections([]);
            }
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: Row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedCollections.some((c) => c.id === row.original.id)}
            onCheckedChange={() => handleSelectCollection(row.original)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Collection Name",
      cell: ({ row }: { row: Row }) => {
        const name = row.original.name;
        return <span className="font-medium">{name}</span>;
      },
    },
    {
      accessorKey: "itemCount",
      header: "Items",
      cell: ({ row }: { row: Row }) => (
        <span className="text-center">{row.getValue("itemCount") || 0}</span>
      ),
    },
    {
      accessorKey: "totalValue",
      header: "Total Value",
      cell: ({ row }: { row: Row }) => {
        const cogs = parseFloat(row.getValue("totalValue")) || 0;
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(cogs);
      },
    },
    {
      accessorKey: "totalProfit",
      header: "Total Profit",
      cell: ({ row }: { row: Row }) => {
        const totalProfit = row.getValue("totalProfit") ?? 0;
        return (
          <span
            className={totalProfit >= 0 ? "text-green-500" : "text-red-500"}
          >
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalProfit)}
          </span>
        );
      },
    },
    {
      accessorKey: "Actions",
      header: "",
      cell: ({ row }: { row: Row }) => (
        <CollectionsRowSettingsButton collectionId={row.original.id} />
      ),
    },
  ];

  const handleSelectCollection = (item: UserCollection) => {
    setSelectedCollections((prev) =>
      prev.some((c) => c.id === item.id)
        ? prev.filter((c) => c.id !== item.id)
        : [...prev, item],
    );
  };

  return (
    <DataTable
      columns={collectionColumns}
      data={data}
      searchPlaceholder="Search collection..."
      gridComponent={(filteredData) => (
        <CollectionsGrid
          data={filteredData}
          selectedCollections={selectedCollections}
          onSelectCollection={handleSelectCollection}
        />
      )}
      tableComponent={(filteredData) => (
        <CollectionsTable
          data={filteredData}
          onRowClick={(row: UserCollection) => (
            <CollectionDetailsSheetContent collection={row} />
          )}
        />
      )}
      enableRowSelection={true}
      selectedRows={selectedCollections}
      onRowSelectionChange={setSelectedCollections}
    />
  );
}

export default CollectionsDataTable;
