"use client";

import { UserInventory } from "@synq/supabase/models/inventory";
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
import { ItemRowSettingsButton } from "@ui/dialogs/items-row-settings-button";

interface ItemsTableProps {
  data: UserInventory[];
  loading?: boolean;
  onRowClick: (item: UserInventory) => void;
}

export function ItemsTable({ data, loading, onRowClick }: ItemsTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Select</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>COGS</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Profit</TableHead>
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
            data.map((item) => {
              const profit = Number(item.listing_price) - Number(item.cogs);
              return (
                <TableRow
                  key={item.id}
                  onClick={() => onRowClick(item)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <Checkbox aria-label="Select item" />
                  </TableCell>
                  <TableCell>
                    {item.custom_name ||
                      item.global_card?.name ||
                      "Unnamed Item"}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(item.cogs)}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(item.listing_price)}
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
                    <ItemRowSettingsButton itemId={item.id} />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No items found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
