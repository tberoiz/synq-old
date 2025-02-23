// CollectionDetailsSheetContent.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { SheetHeader, SheetTitle } from "@synq/ui/sheet";
import { Folder } from "lucide-react";
import { ItemsTable } from "@ui/tables/items-table";
import { fetchItemsByCollection } from "@synq/supabase/queries/inventory";
import { UserCollection } from "@synq/supabase/models/inventory";

interface CollectionDetailsSheetContentProps {
  collection: UserCollection;
}

export function CollectionDetailsSheetContent({
  collection,
}: CollectionDetailsSheetContentProps) {
  const { data: items, isLoading: isFetchingItems } = useQuery({
    queryKey: ["user_inventory", collection.id],
    queryFn: () => fetchItemsByCollection(collection.id),
    enabled: !!collection,
  });

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Folder className="h-6 w-6" />
          <div>
            <div className="text-lg font-medium">{collection.name}</div>
            <div className="text-sm text-muted-foreground">
              Items in this collection
            </div>
          </div>
        </SheetTitle>
      </SheetHeader>
      <div className="py-4">
        <ItemsTable data={items || []} loading={isFetchingItems} />
      </div>
    </>
  );
}
