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
  archivePurchase,
  restorePurchase,
  getUserId,
  updatePurchaseItem,
  fetchPurchaseDetails,
} from "@synq/supabase/queries";
import { purchaseKeys, type PurchaseFilters } from "./keys";
import type { PurchaseTableRow, PurchaseDetails } from "@synq/supabase/types";

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

  const archiveMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      await archivePurchase(supabase, purchaseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (purchaseId: string) => {
      await restorePurchase(supabase, purchaseId);
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
      await updatePurchaseItem(supabase, id, {
        quantity,
        unit_cost,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all });
    },
  });

  return {
    archive: archiveMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
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
