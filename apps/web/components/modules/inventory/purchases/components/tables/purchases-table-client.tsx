"use client";

// REACT
import React, { useCallback, useMemo } from "react";

// COMPONENTS
import { DataTable } from "@ui/shared/components/data-table/data-table";
import { Sheet } from "@synq/ui/sheet";
import { CreatePurchaseDialog } from "@ui/modules/inventory/purchases/components/dialogs/create-purchase-dialog";
import PurchaseDetailsSheet from "@ui/modules/inventory/purchases/components/sheets/purchase-details-sheet";

// HOOKS
import { usePurchaseColumns } from "@ui/modules/inventory/purchases/hooks/use-purchase-columns";
import { usePurchases } from "@ui/modules/inventory/purchases/hooks/use-purchases";

// Queries
import { usePurchaseDetailsQuery } from "@ui/modules/inventory/purchases/queries/purchases";

// Types
import { PurchaseDetails } from "@synq/supabase/types";
import { PurchaseTableRow } from "@synq/supabase/types";
import { ActionDialog } from "@ui/shared/components/dialogs/action-dialog";

import { useQueryState } from 'nuqs'

export function PurchasesTableClient({
  purchases: initialPurchases,
}: {
  purchases: PurchaseTableRow[];
}) {
  const [detailsPurchaseId, setDetailsPurchaseId] = useQueryState('purchaseId', {
    parse: (value): Pick<PurchaseDetails, "id"> | null => 
      value ? { id: value } : null,
    serialize: (value) => value?.id ?? null
  });
  const [actionPurchaseId, setActionPurchaseId] = React.useState<string | null>(null);
  const [dialogType, setDialogType] = React.useState<
    "archive" | "restore" | null
  >(null);
  const [isMobile, setIsMobile] = React.useState(false);

  const { data: selectedPurchaseDetails } = usePurchaseDetailsQuery(
    detailsPurchaseId ? { id: detailsPurchaseId.id } : null
  );

  const {
    purchases: allPurchases,
    setFilters,
    mutations: { archive, restore, updateItem },
    infiniteQuery,
  } = usePurchases(initialPurchases);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSearch = useCallback(
    (term: string) => setFilters((prev) => ({ ...prev, searchTerm: term })),
    [setFilters]
  );

  const handleDialogAction = useCallback(async () => {
    if (!actionPurchaseId) return;

    try {
      if (dialogType === "archive") {
        await archive(actionPurchaseId);
      } else if (dialogType === "restore") {
        await restore(actionPurchaseId);
      }
    } catch (error) {
      console.error("Operation failed:", error);
    } finally {
      setDialogType(null);
      setActionPurchaseId(null);
    }
  }, [actionPurchaseId, dialogType, archive, restore]);

  const handleSaveBatch = useCallback(
    async (updates: { id: string; quantity: number; unit_cost: number }[]) => {
      await Promise.all(
        updates.map((update) =>
          updateItem({
            id: update.id,
            quantity: update.quantity,
            unit_cost: update.unit_cost,
          })
        )
      );
    },
    [updateItem]
  );

  const columns = usePurchaseColumns({
    onArchive: useCallback((purchase) => {
      if (purchase.id) {
        setActionPurchaseId(purchase.id);
        setDialogType("archive");
      }
    }, []),
    onRestore: useCallback((purchase) => {
      if (purchase.id) {
        setActionPurchaseId(purchase.id);
        setDialogType("restore");
      }
    }, []),
    onViewDetails: useCallback((purchase) => {
      if (purchase.id) {
        setDetailsPurchaseId({ id: purchase.id });
      }
    }, []),
  });

  const tableProps = useMemo(
    () => ({
      columns,
      data: allPurchases,
      actions: <CreatePurchaseDialog />,
      searchPlaceholder: "Search purchases...",
      enableRowSelection: false,
      searchColumn: "name",
      idKey: "id",
      onRowClick: (purchase: PurchaseTableRow) =>
        setDetailsPurchaseId(purchase.id ? { id: purchase.id } : null),
      hasNextPage: infiniteQuery.hasNextPage,
      isFetchingNextPage: infiniteQuery.isFetchingNextPage,
      onLoadMore: () => infiniteQuery.fetchNextPage(),
      onSearch: handleSearch,
    }),
    [columns, allPurchases, infiniteQuery, handleSearch]
  );

  return (
    <>
      <DataTable {...tableProps} />

      <Sheet
        open={!!selectedPurchaseDetails}
        onOpenChange={(open) => !open && setDetailsPurchaseId(null)}
      >
        {selectedPurchaseDetails && (
          <PurchaseDetailsSheet
            purchase={selectedPurchaseDetails}
            isMobile={isMobile}
            onSaveBatch={handleSaveBatch}
            open={!!selectedPurchaseDetails}
            onOpenChange={(open) => !open && setDetailsPurchaseId(null)}
          />
        )}
      </Sheet>

      <ActionDialog
        actionType={dialogType}
        isOpen={!!dialogType}
        onOpenChange={(open: boolean) => !open && setDialogType(null)}
        onConfirm={handleDialogAction}
      />
    </>
  );
}
