"use client";

import * as React from "react";
import { UserAcquisitionBatch } from "@synq/supabase/models/inventory";
import { BatchRowSettingsButton } from "@ui/buttons/batch-row-settings-button";
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
import { Sheet, SheetTrigger, SheetContent } from "@synq/ui/sheet";
import { BatchDetailsSheet } from "@ui/sheets/inventory/batch-details-sheet";

interface BatchesTableProps {
  data: UserAcquisitionBatch[];
  loading?: boolean;
}

export function BatchesTable({ data, loading }: BatchesTableProps) {
  return (
    <div className=" border overflow-x-auto">
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
                <Sheet key={batch.id}>
                  <SheetTrigger asChild>
                    <TableRow
                      key={batch.id}
                      className="cursor-pointer bg-secondary/50 hover:bg-primary/10"
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
                        className={
                          profit >= 0 ? "text-green-500" : "text-red-500"
                        }
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
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="min-w-[800px] max-w-2xl overflow-y-auto"
                  >
                    <BatchDetailsSheet batch={batch} />
                  </SheetContent>
                </Sheet>
              );
            })
          ) : (
            // No Data State
            <TableRow className="bg-sencodary/50 hover:bg-primary/10">
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
