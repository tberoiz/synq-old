"use client";

import * as React from "react";
import { UserAcquisitionBatch } from "@synq/supabase/models/inventory";
import { BatchDetailsSheet } from "@ui/sheets/batch-details-sheet";
import { BatchesGrid } from "@ui/grids/inventory/batches-grid";
import { DataTable } from "../data-table";
import { BatchRowSettingsButton } from "@ui/dialogs/batch-row-settings-button";
import { BatchesTable } from "./batches-table";

interface BatchesDataTableProps {
  data: UserAcquisitionBatch[];
  loading: boolean;
}

interface Row {
  getValue: (key: string) => any;
  original: UserAcquisitionBatch;
}

function BatchesDataTable({ data, loading }: BatchesDataTableProps) {
  const [selectedBatches, setSelectedBatches] = React.useState<
    UserAcquisitionBatch[]
  >([]);

  /** Columns Definition for Batches */
  const batchColumns = [
    {
      accessorKey: "name",
      header: "Batch Name",
    },
    {
      accessorKey: "item_count",
      header: "Items",
      cell: ({ row }: { row: Row }) => row.getValue("item_count") ?? 0,
    },
    {
      accessorKey: "total_cogs",
      header: "Total COGS",
      cell: ({ row }: { row: Row }) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(row.getValue("total_cogs") ?? 0),
    },
    {
      accessorKey: "total_listing_price",
      header: "Total Listing Price",
      cell: ({ row }: { row: Row }) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(row.getValue("total_listing_price") ?? 0),
    },
    {
      accessorKey: "total_profit",
      header: "Total Profit",
      cell: ({ row }: { row: Row }) => {
        const totalProfit = row.getValue("total_profit") ?? 0;
        return (
          <span
            className={
              Number(totalProfit) >= 0 ? "text-green-500" : "text-red-500"
            }
          >
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalProfit as number)}
          </span>
        );
      },
    },
    {
      accessorKey: "Actions",
      header: "",
      cell: ({ row }: { row: Row }) => (
        <BatchRowSettingsButton batchId={row.original.id} />
      ),
    },
  ];

  const handleSelectBatch = (batch: UserAcquisitionBatch) => {
    setSelectedBatches((prev) =>
      prev.some((b) => b.id === batch.id)
        ? prev.filter((b) => b.id !== batch.id)
        : [...prev, batch],
    );
  };

  return (
    <DataTable
      columns={batchColumns}
      data={data}
      searchPlaceholder="Search batches..."
      tableComponent={(filteredData) => (
        <BatchesTable
          data={filteredData}
          onRowClick={(row: UserAcquisitionBatch) => (
            <BatchDetailsSheet batch={row} />
          )}
        />
      )}
      gridComponent={(filteredData) => (
        <BatchesGrid
          data={filteredData}
          selectedBatches={selectedBatches}
          onSelectBatch={handleSelectBatch}
        />
      )}
      enableRowSelection={true}
      selectedRows={selectedBatches}
      onRowSelectionChange={setSelectedBatches}
    />
  );
}
export default BatchesDataTable;
