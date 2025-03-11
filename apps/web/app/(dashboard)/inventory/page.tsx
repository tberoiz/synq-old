"use client";

import React, { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@synq/ui/skeleton";
import { createClient } from "@synq/supabase/client";
import { fetchItemsView } from "@synq/supabase/queries";
import { getUserId } from "@synq/supabase/queries";
import { PageContainer } from "@ui/shared/layouts/server/page-container";
import { PageHeader } from "@ui/shared/layouts/server/page-header";
import { CreateItemDialog } from "@ui/modules/inventory/components/dialogs/create-item-dialog";

const ItemsDataTable = lazy(
  () => import("@ui/modules/inventory/components/tables/items-data-table"),
);

export default function InventoryPage() {
  const showArchived = true;
  const supabase = createClient();
  const { data: userId } = useQuery({
    queryKey: ["user_id"],
    queryFn: async () => {
      const id = await getUserId();
      return id;
    },
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
      <PageHeader title="Inventory" />
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        }
      >
        <ItemsDataTable data={items?.data || []} actions={<CreateItemDialog />} />
      </Suspense>
    </PageContainer>
  );
}
