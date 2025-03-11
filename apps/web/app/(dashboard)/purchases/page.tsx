"use client";

import React, { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@synq/ui/skeleton";
import { createClient } from "@synq/supabase/client";
import { fetchPurchases } from "@synq/supabase/queries";
import { getUserId } from "@synq/supabase/queries";
import { PageContainer } from "@ui/shared/layouts/server/page-container";
import { PageHeader } from "@ui/shared/layouts/server/page-header";
import { CreatePurchaseDialog } from "@ui/modules/inventory/components/dialogs/create-purchase-dialog";

const PurchasesDataTable = lazy(
  () => import("@ui/modules/inventory/components/tables/purchases-data-table"),
);

export default function PurchasesPage() {
  const supabase = createClient();
  const { data: userId } = useQuery({
    queryKey: ["user_id"],
    queryFn: async () => {
      const id = await getUserId();
      return id;
    },
  });

  const { data: purchases } = useQuery({
    queryKey: ["user_purchases"],
    queryFn: () => fetchPurchases(supabase, userId!),
    enabled: !!userId,
  });

  const handlePurchaseCreated = () => {
    // Handle the event when a purchase is created
  };

  return (
    <PageContainer>
      <PageHeader title="Purchases" />
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        }
      >
        <PurchasesDataTable data={purchases || []} actions={<CreatePurchaseDialog onSuccess={handlePurchaseCreated} />} />
      </Suspense>
    </PageContainer>
  );
}
