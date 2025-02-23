"use client";

import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, List, Folder } from "lucide-react";
import {
  fetchInventoryBatches,
  fetchAllItems,
  fetchCollections,
} from "@synq/supabase/queries/inventory";
import { CardLayout } from "@ui/layouts/content/card-layout";
import { AddNewBatchDialog } from "@ui/dialogs/add-new-batch-dialog";
import { AddNewCollectionDialog } from "@ui/dialogs/add-new-collection-dialog";
import { CreateItemsDropdown } from "@ui/dropdowns/create-items-dropdown";

// Lazy load the data table components
const CollectionsDataTable = lazy(
  () => import("@ui/tables/inventory/collections-data-table"),
);
const BatchesDataTable = lazy(
  () => import("@ui/tables/inventory/batches-data-table"),
);
const ItemsDataTable = lazy(
  () => import("@ui/tables/inventory/items-data-table"),
);

const InventoryPage = () => {
  const { data: collections, isLoading: isFetchingCollections } = useQuery({
    queryKey: ["user_inventory_collections"],
    queryFn: fetchCollections,
  });

  const { data: batches, isLoading: isFetchingBatches } = useQuery({
    queryKey: ["user_inventory_batches"],
    queryFn: fetchInventoryBatches,
  });

  const { data: items, isLoading: isFetchingItems } = useQuery({
    queryKey: ["user_inventory_items"],
    queryFn: fetchAllItems,
  });

  return (
    <div className="space-y-4">
      {/* Collections Section */}
      <CardLayout
        title="Collections"
        description="Organize your inventory into collections"
        icon={<Folder className="h-4 w-4" />}
        actions={<AddNewCollectionDialog />}
      >
        <Suspense fallback={<div>Loading Collections...</div>}>
          <CollectionsDataTable
            data={collections || []}
            loading={isFetchingCollections}
          />
        </Suspense>
      </CardLayout>

      {/* Batches Section */}
      <CardLayout
        title="Acquisition Batches"
        description="Track and manage your inventory acquisition batches"
        icon={<Package className="h-4 w-4" />}
        actions={<AddNewBatchDialog />}
      >
        <Suspense fallback={<div>Loading Batches...</div>}>
          <BatchesDataTable data={batches || []} loading={isFetchingBatches} />
        </Suspense>
      </CardLayout>

      {/* Items Section */}
      <CardLayout
        title="Items"
        description="View and organize all items in your inventory"
        icon={<List className="h-4 w-4" />}
        actions={<CreateItemsDropdown />}
      >
        <Suspense fallback={<div>Loading Items...</div>}>
          <ItemsDataTable data={items || []} loading={isFetchingItems} />
        </Suspense>
      </CardLayout>
    </div>
  );
};

export default InventoryPage;
