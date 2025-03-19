"use server";

import { Suspense } from "react";
import { Skeleton } from "@synq/ui/skeleton";

// Internal
import ItemsTable from "@ui/modules/inventory/items/components/tables/items-table";

export default async function InventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      }
    >
      <ItemsTable />
    </Suspense>
  );
}
