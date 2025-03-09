"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserId } from "@synq/supabase/queries";
import { getSales } from "@synq/supabase/queries";
import { PageContainer } from "@/ui/layouts/server/page-container";
import { PageHeader } from "@/ui/layouts/server/page-header";
import { Sheet } from "@synq/ui/sheet";
import { CreateSaleDialog } from "@/ui/features/sales/components/dialogs/create-sale-dialog";
import SaleDetailsSheet from "@/ui/features/sales/components/sheets/sale-details-sheet";
import { Sale } from "@synq/supabase/types";
import { SalesTransactionsTable } from "@ui/primitives/data-table/sales/sales-transactions-table";

export default function SalesPage() {
  const [selectedSale, setSelectedSale] = React.useState<Sale | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  // Fetch sales data
  const { data: sales } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const userId = await getUserId();
      return getSales(userId);
    },
  });

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <PageContainer>
      <PageHeader title="Sales">
        <CreateSaleDialog />
      </PageHeader>

      <SalesTransactionsTable data={sales || []} onRowClick={setSelectedSale} />

      <Sheet
        open={!!selectedSale}
        onOpenChange={(open: boolean) => !open && setSelectedSale(null)}
      >
        <SaleDetailsSheet
          sale={selectedSale}
          isMobile={isMobile}
          onOpenChange={(open: boolean) => !open && setSelectedSale(null)}
        />
      </Sheet>
    </PageContainer>
  );
}
