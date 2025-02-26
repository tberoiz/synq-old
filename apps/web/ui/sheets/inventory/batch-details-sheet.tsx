"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SheetDescription, SheetHeader, SheetTitle } from "@synq/ui/sheet";
import { Package, TrendingUp, DollarSign, Tag, User } from "lucide-react";
import {
  fetchItemsByBatch,
  importItemsToBatch,
  fetchUnimportedBatchItems, // Now imported correctly
} from "@synq/supabase/queries/inventory";
import { UserAcquisitionBatch, UserItem } from "@synq/supabase/models/inventory";
import ItemsDataTable from "@ui/data-tables/inventory/items-data-table";
import { ImportItemsDialog } from "@ui/dialogs/import-items-dialog";
import { CreateItemDialog } from "@ui/dialogs/inventory/create-item-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

interface BatchDetailsSheetProps {
  batch: UserAcquisitionBatch;
}

export function BatchDetailsSheet({ batch }: BatchDetailsSheetProps) {
  const queryClient = useQueryClient();

  // Fetch items for the selected batch
  const { data: items, isLoading: isFetchingItems } = useQuery({
    queryKey: ["user_inventory", batch?.id],
    queryFn: () => (batch ? fetchItemsByBatch(batch.id) : []),
    enabled: !!batch,
  });

  // Fetch unimported items (excluding items already in this batch)
  const { data: unimportedItems } = useQuery({
    queryKey: ["unimported_items", batch?.id],
    queryFn: () => (batch ? fetchUnimportedBatchItems(batch.id) : []),
    enabled: !!batch,
  });

  // Handle importing items
  const handleImportItems = async (selectedItems: UserItem[]) => {
    if (!batch) {
      console.error("No batch selected.");
      return;
    }

    try {
      const itemIds = selectedItems.map((item) => item.id);
      await importItemsToBatch(batch.id, itemIds);

      queryClient.invalidateQueries({ queryKey: ["user_inventory", batch.id] });
      queryClient.invalidateQueries({ queryKey: ["unimported_items", batch.id] });

      await queryClient.refetchQueries({ queryKey: ["user_inventory", batch.id] });
    } catch (error) {
      console.error("Failed to import items:", error);
    }
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <div>
            <div className="text-lg font-medium">{batch?.name}</div>
            <SheetDescription className="text-sm text-muted-foreground">
              Items in this batch
            </SheetDescription>
          </div>
        </SheetTitle>
      </SheetHeader>

      {/* Batch Details */}
      <div className="grid grid-cols-3 gap-4 py-4">
        {/* Total COGS Card */}
        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-600">Total COGS</p>
          </div>
          <p className="text-lg font-semibold text-blue-900">
            ${batch.total_cogs.toFixed(2)}
          </p>
        </div>

        {/* Total Listing Price Card */}
        <div className="p-4 border rounded-lg bg-purple-50">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-purple-600" />
            <p className="text-sm text-purple-600">Total Listing Price</p>
          </div>
          <p className="text-lg font-semibold text-purple-900">
            ${batch.total_listing_price.toFixed(2)}
          </p>
        </div>

        {/* Total Profit Card */}
        <div className="p-4 border rounded-lg bg-green-50">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-600">Total Profit</p>
          </div>
          <p className="text-lg font-semibold text-green-900">
            ${batch.total_profit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Supplier Details */}
      <div className="py-4">
        <h3 className="text-lg font-semibold mb-4">Suppliers</h3>
        <div className="space-y-4">
          {/* {batch.suppliers?.map((supplier) => (
            <div
              key={supplier.id}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src="https://via.placeholder.com/150"
                  alt={supplier.name}
                />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{supplier.name}</p>
                {supplier.contact_info && (
                  <p className="text-sm text-muted-foreground">
                    {supplier.contact_info}
                  </p>
                )}
              </div>
            </div>
          ))} */}
        </div>
      </div>

      {/* Items Table */}
      <div className="py-4">
        <ItemsDataTable
          data={items || []}
          loading={isFetchingItems}
          actions={
            <ImportItemsDialog
              items={unimportedItems || []}
              title="Import Items into Batch"
              actions={<CreateItemDialog />}
              onImport={handleImportItems}
            />
          }
        />
      </div>
    </>
  );
}
