"use client";

import * as React from "react";
import { UserAcquisitionBatch } from "@synq/supabase/models/inventory";
import { BatchRowSettingsButton } from "@ui/dialogs/batch-row-settings-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import { Checkbox } from "@synq/ui/checkbox";
import { Skeleton } from "@synq/ui/skeleton";

interface BatchesTableProps {
  data: UserAcquisitionBatch[];
  loading?: boolean;
  onRowClick: (batch: UserAcquisitionBatch) => void;
}

export function BatchesTable({ data, loading, onRowClick }: BatchesTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      {/* DataTable Component */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Select</TableHead>
            <TableHead>Batch Name</TableHead>
            <TableHead>Item Count</TableHead>
            <TableHead>Total COGS</TableHead>
            <TableHead>Total Selling Price</TableHead>
            <TableHead>Total Profit</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // Loading State
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <span>Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            // Render Batches
            data.map((batch) => {
              const profit =
                Number(batch.total_listing_price) - Number(batch.total_cogs);
              return (
                <TableRow
                  key={batch.id}
                  onClick={() => onRowClick(batch)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <Checkbox aria-label="Select batch" />
                  </TableCell>
                  <TableCell>{batch.name}</TableCell>
                  <TableCell>{batch.item_count}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(batch.total_cogs)}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(batch.total_listing_price)}
                  </TableCell>
                  <TableCell
                    className={profit >= 0 ? "text-green-500" : "text-red-500"}
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(profit)}
                  </TableCell>
                  <TableCell>
                    <BatchRowSettingsButton batchId={batch.id} />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            // No Data State
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No batches found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
