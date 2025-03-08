"use client";

import React, { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@synq/ui/skeleton";
import { createClient } from "@synq/supabase/client";
import { fetchPurchases } from "@synq/supabase/queries";
import { getUserId } from "@synq/supabase/queries";
import { CreatePurchaseDialog } from "@ui/dialogs/inventory/create-purchase-dialog";
import { PageContainer } from "@ui/layouts/page-container";
import { PageHeader } from "@ui/layouts/page-header";

const PurchasesDataTable = lazy(
  () => import("@ui/data-tables/inventory/purchases-data-table"),
);

export default function PurchasesPage() {
  const supabase = createClient();
  const { data: userId } = useQuery({
    queryKey: ["user_id"],
    queryFn: getUserId,
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
      <PageHeader title="Purchases">
        <CreatePurchaseDialog onSuccess={handlePurchaseCreated} />
      </PageHeader>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        }
      >
        <PurchasesDataTable data={purchases || []} />
      </Suspense>
    </PageContainer>
  );
}
