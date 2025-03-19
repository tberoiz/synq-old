"use server";

// React & External Dependencies
import { Suspense } from "react";

// UI Components
import { Skeleton } from "@synq/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@synq/ui/tabs";

// Internal Components
import ItemsTable from "@ui/modules/inventory/items/components/tables/items-table";
import PurchasesDataTable from "@ui/modules/inventory/purchases/components/tables/purchases-data-table";

// Icons
import { List, Package } from "lucide-react";

export default async function InventoryPage() {
  return (
    <Tabs defaultValue="items" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="items">
            <List className="h-4 w-4 mr-2" />
            Items
          </TabsTrigger>
          <TabsTrigger value="batches">
            <Package className="h-4 w-4 mr-2" />
            Batches
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Items Tab */}
      <TabsContent value="items">
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
      </TabsContent>

      {/* Batches Tab */}
      <TabsContent value="batches">
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
      </TabsContent>
    </Tabs>
  );
}
