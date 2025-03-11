"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserId } from "@synq/supabase/queries";
import { getSales } from "@synq/supabase/queries";
import { PageContainer } from "@ui/shared/layouts/server/page-container";
import { PageHeader } from "@ui/shared/layouts/server/page-header";
import { SalesTransactionsTable } from "@ui/modules/sales/components/tables/sales-transactions-table";

export default function SalesPage() {
  const { data: sales } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const userId = await getUserId();
      return getSales(userId);
    },
  });

  return (
    <PageContainer>
      <PageHeader title="Sales" />
      <SalesTransactionsTable data={sales || []} />
    </PageContainer>
  );
}
