"use client";

import React, { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@synq/ui/skeleton";
import { createClient } from "@synq/supabase/client";
import { fetchItemsView } from "@synq/supabase/queries";
import { getUserId } from "@synq/supabase/queries";
import { CreateItemDialog } from "@/ui/features/inventory/components/dialogs/create-item-dialog";
import { PageContainer } from "@/ui/layouts/server/page-container";
import { PageHeader } from "@/ui/layouts/server/page-header";

const ItemsDataTable = lazy(
  () => import("@/ui/primitives/data-table/inventory/items-data-table"),
);

export default function InventoryPage() {
  const showArchived = false;
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

  return (
    <PageContainer>
      <PageHeader title="Inventory">
        <CreateItemDialog />
      </PageHeader>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        }
      >
        <ItemsDataTable data={items?.data || []} />
      </Suspense>
    </PageContainer>
  );
}
