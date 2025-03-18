"use client";

import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

// External
import { DataTable } from "@ui/shared/data-table/data-table";
import { createClient } from "@synq/supabase/client";
import {
  archivePurchase,
  restorePurchase,
  fetchPurchases,
  getUserId,
  updatePurchaseItem,
  fetchPurchaseDetails,
} from "@synq/supabase/queries";

// Dialogs
import { ArchiveDialog } from "@ui/shared/dialogs/archive-dialog";
import { RestoreDialog } from "@ui/shared/dialogs/restore-dialog";

// Sheets
import { Sheet } from "@synq/ui/sheet";
import PurchaseDetailsSheet from "../sheets/purchase-details-sheet";

// Columns
import { usePurchaseColumns } from "../hooks/use-purchase-columns";

// Types
import { PurchaseDetails } from "@synq/supabase/types";
import { PurchaseTableRow } from "@synq/supabase/types";
import { CreatePurchaseDialog } from "../dialogs/create-purchase-dialog";

export function PurchasesTableClient({
  purchases: initialPurchases,
}: {
  purchases: PurchaseTableRow[];
}) {
  const queryClient = useQueryClient();
  const [selectedPurchase, setSelectedPurchase] =
    React.useState<PurchaseDetails | null>(null);
  const [dialogType, setDialogType] = React.useState<
    "archive" | "restore" | null
  >(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isMobile, setIsMobile] = React.useState(false);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["user_purchases", searchTerm],
    queryFn: async ({ pageParam = 1 }) => {
      const userId = await getUserId();
      const showArchived = true;
      const response = await fetchPurchases(supabase, {
        userId,
        page: pageParam,
        includeArchived: showArchived,
        searchTerm,
      });
      return {
        data: response.data,
        nextPage: response.data.length === 10 ? pageParam + 1 : 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage || undefined,
    initialData: !searchTerm
      ? {
          pages: [{ data: initialPurchases, nextPage: 2 }],
          pageParams: [1],
        }
      : undefined,
    initialPageParam: 1,
  });

  const allPurchases = React.useMemo(() => {
    const purchases = data?.pages.flatMap((page) => page.data) ?? [];
    // Create a Map to store unique purchases by id
    const uniquePurchases = new Map<string, PurchaseTableRow>();
    purchases.forEach((purchase) => {
      if (purchase.id) {
        uniquePurchases.set(purchase.id, purchase);
      }
    });
    return Array.from(uniquePurchases.values());
  }, [data]);

  const handleSearch = React.useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleArchive = async () => {
    if (!selectedPurchase?.id) return;
    await archivePurchase(supabase, selectedPurchase.id);
    queryClient.invalidateQueries({ queryKey: ["user_purchases"] });
    setDialogType(null);
  };

  const handleRestore = async () => {
    if (!selectedPurchase?.id) return;
    await restorePurchase(supabase, selectedPurchase.id);
    queryClient.invalidateQueries({ queryKey: ["user_purchases"] });
    setDialogType(null);
  };

  const handleSaveBatch = async (
    updates: { id: string; quantity: number; unit_cost: number }[]
  ) => {
    await Promise.all(
      updates.map((update) =>
        updatePurchaseItem(supabase, update.id, {
          quantity: update.quantity,
          unit_cost: update.unit_cost,
        })
      )
    );
    await queryClient.invalidateQueries({
      queryKey: ["user_purchases"],
    });
  };

  const handleViewDetails = async (purchase: PurchaseTableRow) => {
    const details = await fetchPurchaseDetails(supabase, purchase.id);
    setSelectedPurchase(details);
  };

  const columns = usePurchaseColumns({
    onArchive: (purchase) => {
      if (purchase.id) {
        handleViewDetails(purchase);
        setDialogType("archive");
      }
    },
    onRestore: (purchase) => {
      if (purchase.id) {
        handleViewDetails(purchase);
        setDialogType("restore");
      }
    },
    onViewDetails: handleViewDetails,
  });

  return (
    <>
      <DataTable
        columns={columns}
        data={allPurchases}
        searchPlaceholder="Search purchases..."
        searchColumn="name"
        onRowClick={handleViewDetails}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        onSearch={handleSearch}
        actions={<CreatePurchaseDialog />}
      />

      <Sheet
        open={!!selectedPurchase}
        onOpenChange={(open) => !open && setSelectedPurchase(null)}
      >
        {selectedPurchase && (
          <PurchaseDetailsSheet
            purchase={selectedPurchase}
            isMobile={isMobile}
            onSaveBatch={handleSaveBatch}
            open={!!selectedPurchase}
            onOpenChange={(open) => !open && setSelectedPurchase(null)}
          />
        )}
      </Sheet>

      <ArchiveDialog
        isOpen={dialogType === "archive"}
        onOpenChange={(open: boolean) => !open && setDialogType(null)}
        selectedItem={{ id: selectedPurchase?.id || "" }}
        onArchive={handleArchive}
        queryKey={["user_purchases"]}
      />

      <RestoreDialog
        isOpen={dialogType === "restore"}
        onOpenChange={(open: boolean) => !open && setDialogType(null)}
        selectedItem={{ id: selectedPurchase?.id || "" }}
        onRestore={handleRestore}
        queryKey={["user_purchases"]}
      />
    </>
  );
}
