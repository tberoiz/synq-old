"use client";

import { UserCollection } from "@synq/supabase/models/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import { Skeleton } from "@synq/ui/skeleton";
import { Checkbox } from "@synq/ui/checkbox";
import React from "react";
import { CollectionsRowSettingsButton } from "@ui/dialogs/collections-row-settings-button";

interface CollectionsTableProps {
  data: UserCollection[];
  loading?: boolean;
  onRowClick: (collection: UserCollection) => void;
}

export function CollectionsTable({
  data,
  loading,
  onRowClick,
}: CollectionsTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Select</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Item Count</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Total Profit</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <span>Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length > 0 ? (
            data.map((collection) => {
              return (
                <TableRow
                  key={collection.id}
                  onClick={() => onRowClick(collection)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <Checkbox aria-label="Select item" />
                  </TableCell>
                  <TableCell>{collection.name}</TableCell>
                  <TableCell>{collection.itemCount}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(collection.totalValue)}
                  </TableCell>
                  <TableCell
                    className={
                      collection.totalProfit >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(collection.totalProfit)}
                  </TableCell>
                  <TableCell>
                    <CollectionsRowSettingsButton
                      collectionId={collection.id}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No collections found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
