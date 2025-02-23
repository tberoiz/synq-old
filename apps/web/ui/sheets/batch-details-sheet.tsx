"use client";

import { useQuery } from "@tanstack/react-query";
import { SheetHeader, SheetTitle } from "@synq/ui/sheet";
import { Package } from "lucide-react";
import { fetchItemsByBatch } from "@synq/supabase/queries/inventory";
import { UserAcquisitionBatch } from "@synq/supabase/models/inventory";
import ItemsDataTable from "@ui/tables/inventory/items-data-table";

interface BatchDetailsSheetProps {
  batch: UserAcquisitionBatch | null;
}

export function BatchDetailsSheet({ batch }: BatchDetailsSheetProps) {
  // Fetch items for the selected batch
  const { data: items, isLoading: isFetchingItems } = useQuery({
    queryKey: ["user_inventory", batch?.id],
    queryFn: () => (batch ? fetchItemsByBatch(batch.id) : []),
  });

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <div>
            <div className="text-lg font-medium">{batch?.name}</div>
            <div className="text-sm text-muted-foreground">
              Items in this batch
            </div>
          </div>
        </SheetTitle>
      </SheetHeader>

      {/* Items Table */}
      <div className="py-4">
        <ItemsDataTable data={items || []} loading={isFetchingItems} />
      </div>
    </>
  );
}
