"use client";

import { Package, Plus } from "lucide-react";
import { UserCollection } from "@synq/supabase/models/inventory";
import { Sheet, SheetTrigger, SheetContent } from "@synq/ui/sheet";
import { CollectionDetailsSheetContent } from "@ui/sheets/collection-details-sheet";
import { CollectionCard } from "@ui/cards/collection-card";
import { AddNewCollectionDialog } from "@ui/dialogs/add-new-collection-dialog";
import { Button } from "@synq/ui/button";
import { DialogTrigger } from "@synq/ui/dialog";
interface CollectionsGridProps {
  data: UserCollection[];
  selectedCollections: UserCollection[];
  onSelectCollection: (collection: UserCollection) => void;
}

export function CollectionsGrid({
  data,
  selectedCollections,
  onSelectCollection,
}: CollectionsGridProps) {
  return (
    <div>
      {/* Grid Items */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.length > 0 ? (
          data.map((collection) => (
            <Sheet key={collection.id}>
              <SheetTrigger asChild>
                <CollectionCard
                  id={collection.id}
                  name={collection.name}
                  itemCount={collection.itemCount}
                  totalValue={collection.totalValue}
                  totalProfit={collection.totalProfit}
                  isSelected={selectedCollections.some(
                    (c) => c.id === collection.id,
                  )}
                  onSelect={(e) => {
                    e.stopPropagation();
                    onSelectCollection(collection);
                  }}
                />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full max-w-2xl overflow-y-auto"
              >
                <CollectionDetailsSheetContent collection={collection} />
              </SheetContent>
            </Sheet>
          ))
        ) : (
          <EmptyState />
        )}

        {/* Add New Collection Button */}
        <AddNewCollectionDialog
          trigger={
            <DialogTrigger asChild>
              <Button variant="outline" className="border-dashed h-full w-full">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </Button>
            </DialogTrigger>
          }
        />
      </div>
    </div>
  );
}

// Empty State Component
const EmptyState = () => (
  <div className="text-center py-8">
    <Package className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
    <h3 className="font-medium mb-1 text-sm">No collections found</h3>
    <p className="text-muted-foreground mb-3 text-sm">
      Start by creating a new collection.
    </p>
  </div>
);
