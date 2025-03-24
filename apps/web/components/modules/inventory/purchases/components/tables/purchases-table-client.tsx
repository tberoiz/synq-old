"use client";

// REACT
import React, { useCallback, useMemo, useState } from "react";

// COMPONENTS
import { DataTable } from "@ui/shared/components/data-table/data-table";
import { Sheet } from "@synq/ui/sheet";
import { CreatePurchaseDialog } from "@ui/modules/inventory/purchases/components/dialogs/create-purchase-dialog";
import PurchaseDetailsSheet from "@ui/modules/inventory/purchases/components/sheets/purchase-details-sheet";
import { Button } from "@synq/ui/button";
import { Trash2 } from "lucide-react";

// HOOKS
import { usePurchaseColumns } from "@ui/modules/inventory/purchases/hooks/use-purchase-columns";
import { usePurchases } from "@ui/modules/inventory/purchases/hooks/use-purchases";

// Queries
import { usePurchaseDetailsQuery } from "@ui/modules/inventory/purchases/queries/purchases";

// Types
import { PurchaseTableRow } from "@synq/supabase/types";
import { DeleteActionDialog } from "@ui/shared/components/dialogs/delete-action-dialog";

import { useQueryState } from 'nuqs'

export function PurchasesTableClient({
  purchases: initialPurchases,
}: {
  purchases: PurchaseTableRow[];
}) {
  const [detailsPurchaseId, setDetailsPurchaseId] = useQueryState('purchaseId', {
    parse: (value): string | null => value ?? null,
    serialize: (value) => value ?? null
  });
  const [actionPurchaseId, setActionPurchaseId] = React.useState<string | null>(null);
  const [dialogType, setDialogType] = React.useState<"delete" | "bulk_delete" | null>(null);
  const [selectedPurchases, setSelectedPurchases] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = React.useState(false);

  const { data: selectedPurchaseDetails } = usePurchaseDetailsQuery(
    detailsPurchaseId ? { id: detailsPurchaseId } : null
  );

  const {
    purchases: allPurchases,
    setFilters,
    mutations,
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

  const handleDelete = useCallback((purchase: PurchaseTableRow | string) => {
    const purchaseId = typeof purchase === 'string' ? purchase : purchase.id;
    if (purchaseId) {
      setActionPurchaseId(purchaseId);
      setDialogType("delete");
    }
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selectedPurchases.size === 0) return;
    setDialogType("bulk_delete");
  }, [selectedPurchases]);

  const handleDialogAction = useCallback(async () => {
    if (!dialogType) return;

    try {
      if (dialogType === "delete" && actionPurchaseId) {
        await mutations.delete(actionPurchaseId);
      } else if (dialogType === "bulk_delete") {
        await Promise.all(
          Array.from(selectedPurchases).map((purchaseId) => mutations.delete(purchaseId))
        );
        setSelectedPurchases(new Set());
      }
    } catch (error) {
      console.error("Operation failed:", error);
    } finally {
      setDialogType(null);
      setActionPurchaseId(null);
    }
  }, [actionPurchaseId, dialogType, mutations, selectedPurchases]);

  const handleSelectPurchase = useCallback((purchaseId: string) => {
    setSelectedPurchases((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(purchaseId)) {
        newSelected.delete(purchaseId);
      } else {
        newSelected.add(purchaseId);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedPurchases((prev) => {
      if (prev.size === allPurchases.length) {
        return new Set();
      }
      return new Set(allPurchases.map((purchase) => purchase.id));
    });
  }, [allPurchases]);

  const handleSaveBatch = useCallback(
    async (updates: { id: string; quantity: number; unit_cost: number }[]) => {
      await Promise.all(
        updates.map((update) =>
          mutations.updateItem({
            id: update.id,
            quantity: update.quantity,
            unit_cost: update.unit_cost,
          })
        )
      );
    },
    [mutations]
  );

  const columns = usePurchaseColumns({
    onDelete: handleDelete,
    selectedPurchases,
    onSelectPurchase: handleSelectPurchase,
    onSelectAll: handleSelectAll,
  });

  const tableProps = useMemo(
    () => ({
      columns,
      data: allPurchases,
      actions: (
        <div className="flex items-center gap-2">
          {selectedPurchases.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedPurchases.size})
            </Button>
          )}
          <CreatePurchaseDialog />
        </div>
      ),
      searchPlaceholder: "Search purchases...",
      enableRowSelection: true,
      searchColumn: "name",
      idKey: "id",
      onRowClick: (purchase: PurchaseTableRow) => {
        // Don't open details if clicking on checkbox
        const target = event?.target as HTMLElement;
        if (target?.closest('[role="checkbox"]')) return;
        setDetailsPurchaseId(purchase.id);
      },
      hasNextPage: infiniteQuery.hasNextPage,
      isFetchingNextPage: infiniteQuery.isFetchingNextPage,
      onLoadMore: () => infiniteQuery.fetchNextPage(),
      onSearch: handleSearch,
      selectedRows: allPurchases.filter((purchase) => selectedPurchases.has(purchase.id)),
      onRowSelectionChange: (rows: PurchaseTableRow[]) => {
        setSelectedPurchases(new Set(rows.map((row) => row.id)));
      },
    }),
    [columns, allPurchases, infiniteQuery, handleSearch, selectedPurchases, handleBulkDelete]
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

      <DeleteActionDialog
        actionType={dialogType}
        isOpen={!!dialogType}
        onOpenChange={(open: boolean) => !open && setDialogType(null)}
        onConfirm={handleDialogAction}
        title={dialogType === "bulk_delete" ? `Delete ${selectedPurchases.size} purchases?` : "Delete purchase?"}
        description={dialogType === "bulk_delete" 
          ? `Are you sure you want to delete ${selectedPurchases.size} purchases? This action cannot be undone.`
          : "Are you sure you want to delete this purchase? This action cannot be undone."}
      />
    </>
  );
}
