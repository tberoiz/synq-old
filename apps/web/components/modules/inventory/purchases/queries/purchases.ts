import React from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createClient } from "@synq/supabase/client";
import {
  fetchPurchases,
  getUserId,
  fetchPurchaseDetails,
  addItemToPurchase,
  fetchItemsView,
} from "@synq/supabase/queries";
import { purchaseKeys, type PurchaseFilters } from "./keys";
import type { PurchaseTableRow, PurchaseDetails, ImportItem } from "@synq/supabase/types";

export function useInfinitePurchasesQuery(
  filters: PurchaseFilters,
  initialData?: PurchaseTableRow[]
) {
  const supabase = React.useMemo(() => createClient(), []);

  return useInfiniteQuery({
    queryKey: purchaseKeys.infinite(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const userId = await getUserId();
      const response = await fetchPurchases(supabase, {
        userId,
        page: pageParam,
        includeArchived: filters.includeArchived ?? true,
        searchTerm: filters.searchTerm,
      });
      return {
        data: response.data,
        nextPage: response.data.length === 10 ? pageParam + 1 : 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage || undefined,
    initialData: !filters.searchTerm
      ? {
          pages: [{ data: initialData ?? [], nextPage: 2 }],
          pageParams: [1],
        }
      : undefined,
    initialPageParam: 1,
  });
}

export function usePurchaseMutations() {
  const queryClient = useQueryClient();
  const supabase = React.useMemo(() => createClient(), []);

  const deleteMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      const { error } = await supabase.rpc('delete_purchase_batch', { batch_id_param: purchaseId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({
      id,
      quantity,
      unit_cost,
    }: {
      id: string;
      quantity: number;
      unit_cost: number;
    }) => {
      const { error } = await supabase
        .from("user_purchase_items")
        .update({
          quantity,
          unit_cost,
          remaining_quantity: quantity,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });

  return {
    delete: deleteMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
  };
}

export function usePurchaseDetailsQuery(
  purchaseId: Pick<PurchaseDetails, "id"> | null
) {
  const supabase = React.useMemo(() => createClient(), []);

  return useQuery({
    queryKey: purchaseKeys.details(purchaseId?.id ?? ""),
    queryFn: () =>
      purchaseId ? fetchPurchaseDetails(supabase, purchaseId.id) : null,
    enabled: !!purchaseId,
  });
}

export function usePurchaseDetailsSheetQueries(purchaseId: string | null) {
  const queryClient = useQueryClient();
  const supabase = React.useMemo(() => createClient(), []);
  const { updateItem } = usePurchaseMutations();

  const { data: userId } = useQuery({
    queryKey: ["user_id"],
    queryFn: getUserId,
    enabled: !!purchaseId,
  });

  const { data: purchaseDetails } = useQuery<PurchaseDetails | null>({
    queryKey: purchaseKeys.details(purchaseId ?? ""),
    queryFn: () => {
      if (!purchaseId) return null;
      return fetchPurchaseDetails(supabase, purchaseId);
    },
    enabled: !!purchaseId,
  });

  const { data: inventoryItems, isLoading: isItemsLoading } = useQuery({
    queryKey: ["inventory_items"],
    queryFn: async () => {
      const userId = await getUserId();
      return fetchItemsView(supabase, {
        userId,
        page: 10,
        includeArchived: false,
      });
    },
    enabled: !!purchaseId,
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: {
      item_id: string;
      quantity: number;
      unit_cost: number;
    }) => {
      if (!userId || !purchaseId)
        throw new Error("User ID and Purchase are required");
      return addItemToPurchase(
        supabase,
        purchaseId,
        data.item_id,
        data.quantity,
        data.unit_cost,
        userId
      );
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseKeys.all }),
        queryClient.invalidateQueries({
          queryKey: purchaseKeys.details(purchaseId ?? ""),
        }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
      ]);
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!purchaseId) throw new Error("Purchase ID is required");
      const { error } = await supabase
        .from("user_purchase_batches")
        .update({ name })
        .eq("id", purchaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: purchaseKeys.details(purchaseId ?? ""),
      });
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (purchaseItemId: string) => {
      const { error } = await supabase
        .from("user_purchase_items")
        .delete()
        .eq("id", purchaseItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseKeys.all }),
        queryClient.invalidateQueries({
          queryKey: purchaseKeys.details(purchaseId ?? ""),
        }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
      ]);
    },
  });

  const importItemsMutation = useMutation({
    mutationFn: async (selectedItems: ImportItem[]) => {
      if (!userId || !purchaseId)
        throw new Error("User ID and Purchase are required");

      await Promise.all(
        selectedItems.map((item) =>
          addItemToPurchase(
            supabase,
            purchaseId,
            item.item_id,
            1,
            item.listing_price || 0,
            userId
          )
        )
      );
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseKeys.all }),
        queryClient.invalidateQueries({
          queryKey: purchaseKeys.details(purchaseId ?? ""),
        }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
      ]);
    },
  });

  return {
    userId,
    purchaseDetails,
    inventoryItems,
    isItemsLoading,
    addItem: addItemMutation.mutateAsync,
    updateItem,
    updateName: updateNameMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,
    importItems: importItemsMutation.mutateAsync,
  };
}
