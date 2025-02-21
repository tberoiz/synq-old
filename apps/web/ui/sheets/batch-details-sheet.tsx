"use client";

import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@synq/ui/sheet";
import { Package } from "lucide-react";
import { ItemsTable } from "@ui/tables/items-table";
import { fetchItemsByBatch } from "@synq/supabase/queries/inventory";
import { UserAcquisitionBatch } from "@synq/supabase/models/inventory";

interface BatchDetailsSheetProps {
  batch: UserAcquisitionBatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatchDetailsSheet({
  batch,
  open,
  onOpenChange,
}: BatchDetailsSheetProps) {
  // Fetch items for the selected batch
  const { data: items, isLoading: isFetchingItems } = useQuery({
    queryKey: ["user_inventory", batch?.id],
    queryFn: () => (batch ? fetchItemsByBatch(batch.id) : []),
    enabled: !!batch && open,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full min-w-[800px] max-w-2xl">
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
          <ItemsTable data={items || []} loading={isFetchingItems} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
