"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { AcquisitionBatchesTable } from "@ui/tables/acquisition-batches-table";
import { ItemsTable } from "@ui/tables/items-table";
import { CollectionsTable } from "@ui/tables/collections-table";

import {
  fetchInventoryBatches,
  fetchAllItems,
  fetchCollections,
} from "@synq/supabase/queries/inventory";
import {
  UserAcquisitionBatch,
  UserCollection,
} from "@synq/supabase/models/inventory";
import { AddNewBatchDialog } from "@ui/dialogs/add-new-batch-dialog";
import { CreateItemsDropdown } from "@ui/dropdowns/create-items-dropdown";
import { CardLayout } from "@ui/layouts/content/card-layout";
import { Package, List, Folder } from "lucide-react";
import { AddNewCollectionDialog } from "@ui/dialogs/add-new-collection-dialog";

const InventoryPage = () => {
  const [selectedBatch, setSelectedBatch] =
    useState<UserAcquisitionBatch | null>(null);
  const [selectedCollection, setSelectedCollection] =
    useState<UserCollection | null>(null);

  // Fetch collections
  const { data: collections, isLoading: isFetchingCollections } = useQuery({
    queryKey: ["user_inventory_collections"],
    queryFn: fetchCollections,
  });

  // Fetch batches
  const { data: batches, isLoading: isFetchingBatches } = useQuery({
    queryKey: ["user_inventory_batches"],
    queryFn: fetchInventoryBatches,
  });

  // Fetch items
  const { data: items, isLoading: isFetchingItems } = useQuery({
    queryKey: ["user_inventory_items"],
    queryFn: fetchAllItems,
  });

  const handleBatchClick = (batch: UserAcquisitionBatch) =>
    setSelectedBatch(batch);

  const handleCollectionClick = (collection: UserCollection) =>
    setSelectedCollection(collection);

  return (
    <div className="space-y-4">
      {/* Collections Table */}
      <CardLayout
        title="Collections"
        description="Organize your inventory into collections"
        icon={<Folder className="h-4 w-4" />}
        actions={<AddNewCollectionDialog />}
      >
        <CollectionsTable
          collections={collections || []}
          isFetching={isFetchingCollections}
        />
      </CardLayout>

      {/* Batches Table */}
      <CardLayout
        title="Acquisition Batches"
        description="Track and manage your inventory acquisition batches"
        icon={<Package className="h-4 w-4" />}
        actions={<AddNewBatchDialog />}
      >
        <AcquisitionBatchesTable
          batches={batches || []}
          isFetching={isFetchingBatches}
          selectedBatch={selectedBatch}
          onBatchClick={handleBatchClick}
        />
      </CardLayout>

      {/* Items Table */}
      <CardLayout
        title="Items"
        description="View and organize all items in your inventory"
        icon={<List className="h-4 w-4" />}
        actions={<CreateItemsDropdown />}
      >
        <ItemsTable data={items || []} loading={isFetchingItems} />
      </CardLayout>
    </div>
  );
};

export default InventoryPage;
