"use server";

import { Suspense } from "react";
import { Skeleton } from "@synq/ui/skeleton";

// Internal
import PurchasesDataTable from "@ui/modules/inventory/purchases/components/tables/purchases-data-table";

export default async function PurchasesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      }
    >
      <PurchasesDataTable />
    </Suspense>
  );
}
