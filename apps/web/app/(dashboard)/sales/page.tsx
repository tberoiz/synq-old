"use client";

import { useQuery } from "@tanstack/react-query";
import { CardLayout } from "@ui/layouts/content/card-layout";
// import { SalesBatchesTable } from "@ui/tables/sales/sales-batches-table";
import { fetchSalesBatches } from "@synq/supabase/queries/sales";
import { NewSalesBatchDialog } from "@ui/dialogs/create-sales-batch-dialog";

export default function SalesPage() {
  // Fetch sales batches from the database.
  const { data: salesBatches, isLoading: isFetchingSalesBatches } = useQuery({
    queryKey: ["sales_batches"],
    queryFn: fetchSalesBatches,
  });

  return (
    <div className="space-y-4">
      {/* <CardLayout
        title="Sales Batches"
        description="Manage your sales batches and track their status."
      >
        <SalesBatchesTable
          data={salesBatches || []}
          loading={isFetchingSalesBatches}
        />
      </CardLayout> */}
    </div>
  );
}
