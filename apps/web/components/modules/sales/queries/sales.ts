import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getSale,
  updateSale,
  deleteSale,
  getUserId,
  getSales,
} from "@synq/supabase/queries";
import { saleKeys } from "./keys";

/**
 * Hook for fetching paginated sales data with infinite scrolling support.
 * @param options - Optional filters for the sales query.
 * @returns {Object} - The infinite query result containing sales data and pagination info.
 */
export function useSalesInfiniteQuery(options?: {
  status?: "listed" | "completed" | "cancelled";
}) {
  return useInfiniteQuery({
    queryKey: [...saleKeys.all, options],
    queryFn: async ({ pageParam = 1 }) => {
      const userId = await getUserId();
      return getSales(userId, {
        page: pageParam,
        pageSize: 10,
        status: options?.status,
      });
    },
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.count / 10);
      return lastPage.data.length > 0 && lastPage.data.length < lastPage.count
        ? lastPage.data.length / 10 + 1
        : undefined;
    },
    initialPageParam: 1,
  });
}

/**
 * Hook for fetching detailed information about a specific sale.
 * @param saleId - The ID of the sale to fetch details for.
 * @returns {Object} - The query result containing the sale details.
 */
export function useSaleDetailsQuery(saleId: string | null) {
  return useQuery({
    queryKey: saleKeys.detail(saleId ?? ""),
    queryFn: async () => {
      if (!saleId) return null;
      const userId = await getUserId();
      return getSale(userId, saleId);
    },
    enabled: !!saleId,
  });
}

/**
 * Hook for managing sale mutations (update, delete, bulk delete).
 * @returns {Object} - Object containing mutation functions and their states.
 */
export function useSaleMutations() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({
      saleId,
      updates,
    }: {
      saleId: string;
      updates: {
        status?: string;
        platform?: string;
        saleDate?: Date;
        shippingCost?: number;
        taxAmount?: number;
        platformFees?: number;
        notes?: string | null;
        items?: Array<{
          purchaseItemId: string;
          quantity: number;
          salePrice: number;
        }>;
      };
    }) => {
      const userId = await getUserId();
      return updateSale(userId, saleId, updates);
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: saleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["user_inv_items"] }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (saleId: string) => {
      const userId = await getUserId();
      return deleteSale(userId, saleId);
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: saleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["user_inv_items"] }),
      ]);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (saleIds: string[]) => {
      const userId = await getUserId();
      await Promise.all(saleIds.map((saleId) => deleteSale(userId, saleId)));
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: saleKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["user_inv_items"] }),
      ]);
    },
  });

  return {
    update: {
      mutate: updateMutation.mutateAsync,
      isPending: updateMutation.isPending,
    },
    delete: {
      mutate: deleteMutation.mutateAsync,
      isPending: deleteMutation.isPending,
    },
    bulkDelete: {
      mutate: bulkDeleteMutation.mutateAsync,
      isPending: bulkDeleteMutation.isPending,
    },
  };
}
