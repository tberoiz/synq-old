"use client";

import { Package } from "lucide-react";
import { UserCollection } from "@synq/supabase/models/inventory";
import { CollectionCard } from "@ui/cards/collection-card";

interface CollectionsGridProps {
  collections: UserCollection[];
  isFetching: boolean;
  selectedCollection: UserCollection | null;
  onCollectionClick: (collection: UserCollection) => void;
}

export function CollectionsGrid({
  collections,
  isFetching,
  selectedCollection,
  onCollectionClick,
}: CollectionsGridProps) {
  if (isFetching) {
    return (
      <p className="text-center text-muted-foreground">
        Loading collections...
      </p>
    );
  }

  if (!collections || collections.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          id={collection.id}
          name={collection.name}
          itemCount={collection.itemCount || 0}
          totalValue={collection.totalValue || 0}
          totalProfit={collection.totalProfit || 0}
          isActive={selectedCollection?.id === collection.id}
          onClick={() => onCollectionClick(collection)}
        />
      ))}
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
