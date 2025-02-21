"use client";

import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@synq/ui/sheet";
import { Folder } from "lucide-react";
import { ItemsTable } from "@ui/tables/items-table";
import { fetchItemsByCollection } from "@synq/supabase/queries/inventory";
import { UserCollection } from "@synq/supabase/models/inventory";

interface CollectionDetailsSheetProps {
  collection: UserCollection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CollectionDetailsSheet({
  collection,
  open,
  onOpenChange,
}: CollectionDetailsSheetProps) {
  // Fetch items for the selected collection
  const { data: items, isLoading: isFetchingItems } = useQuery({
    queryKey: ["user_inventory", collection?.id],
    queryFn: () => (collection ? fetchItemsByCollection(collection.id) : []),
    enabled: !!collection && open,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full min-w-[800px] max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Folder className="h-6 w-6" />
            <div>
              <div className="text-lg font-medium">{collection?.name}</div>
              <div className="text-sm text-muted-foreground">
                Items in this collection
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
