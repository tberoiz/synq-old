"use client";

import React, { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { List, Package } from "lucide-react";
import { Skeleton } from "@synq/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@synq/ui/tabs";
import { createClient } from "@synq/supabase/client";
import { fetchItemsView } from "@synq/supabase/queries";
import { getUserId } from "@synq/supabase/queries";
import { fetchPurchases } from "@synq/supabase/queries";
import { useRouter, useSearchParams } from "next/navigation";
import { CreateItemDialog } from "@ui/dialogs/inventory/create-item-dialog";
import { Button } from "@synq/ui/button";

const ItemsDataTable = lazy(
  () => import("@ui/data-tables/inventory/items-data-table"),
);
const PurchasesDataTable = lazy(
  () => import("@ui/data-tables/inventory/purchases-data-table"),
);

const InventoryPage = () => {
  const [currentTab, setCurrentTab] = React.useState("items");
  const [showArchived, setShowArchived] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { data: userId } = useQuery({
    queryKey: ["user_id"],
    queryFn: getUserId,
  });

  const { data: items } = useQuery({
    queryKey: ["user_inv_items", showArchived],
    queryFn: () =>
      fetchItemsView(supabase, {
        userId: userId!,
        page: 1,
        includeArchived: showArchived,
      }),
    enabled: !!userId,
  });

  const { data: purchases } = useQuery({
    queryKey: ["user_purchases"],
    queryFn: () => fetchPurchases(supabase, userId!),
    enabled: !!userId,
  });

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    router.push(`/inventory?tab=${value}`);
  };

  React.useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setCurrentTab(tab);
    }
  }, [searchParams]);

  return (
    <Tabs
      value={currentTab}
      onValueChange={handleTabChange}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="items">
            <List className="h-4 w-4 mr-2" />
            Items
          </TabsTrigger>
          <TabsTrigger value="purchases">
            <Package className="h-4 w-4 mr-2" />
            Purchases
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? "Hide Archived" : "Show Archived"}
              </Button>
            </div>
          </div>
          <ItemsDataTable
            data={items?.data || []}
            actions={<CreateItemDialog />}
            includeArchived={showArchived}
          />
        </Suspense>
      </TabsContent>

      {/* Purchases Tab */}
      <TabsContent value="purchases">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          }
        >
          <div className="flex justify-end mb-4"></div>
          <PurchasesDataTable data={purchases || []} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
};

export default InventoryPage;
