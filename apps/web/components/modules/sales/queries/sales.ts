// REACT QUERY
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

// API
import {
  getSale,
  updateSale,
  deleteSale,
  getUserId,
  getSales,
  createSale,
  getSaleItemsForTable,
} from "@synq/supabase/queries";
import { type CreateSaleInput, type Sale } from "@synq/supabase/types";

// LOCAL
import { saleKeys } from "./keys";

// Define the update structure type
type SaleUpdateData = {
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
      return await getSale(userId, saleId);
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

  const addItemsMutation = useMutation({
    mutationFn: async ({
      saleId,
      items,
    }: {
      saleId: string;
      items: Array<{
        purchase_item_id: string;
        sold_quantity: number;
        sale_price: number;
      }>;
    }) => {
      const userId = await getUserId();
      return updateSale(userId, saleId, {
        items: items.map(item => ({
          purchaseItemId: item.purchase_item_id,
          quantity: item.sold_quantity,
          salePrice: item.sale_price,
        })),
      });
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
    addItems: {
      mutate: addItemsMutation.mutateAsync,
      isPending: addItemsMutation.isPending,
    },
  };
}

/**
 * Hook for updating a sale.
 * @returns {Object} - The mutation object for updating a sale.
 */
export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; updates: Partial<SaleUpdateData> }) => {
      const userId = await getUserId();
      return updateSale(userId, data.id, data.updates);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: saleKeys.detail(variables.id) });
      
      const previousSale = queryClient.getQueryData<Sale>(
        saleKeys.detail(variables.id)
      );

      if (previousSale) {
        queryClient.setQueryData(saleKeys.detail(variables.id), {
          ...previousSale,
          ...variables.updates
        });
      }

      return { previousSale };
    },
    onError: (err, variables, context) => {
      if (context?.previousSale) {
        queryClient.setQueryData(
          saleKeys.detail(variables.id),
          context.previousSale
        );
      }
    },
    onSettled: (data) => {
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: saleKeys.detail(data.id) });
      }
    }
  });
}

/**
 * Hook for creating a new sale.
 * @returns {Object} - Object containing the create mutation function and its state.
 */
export function useCreateSaleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSaleInput) => {
      const userId = await getUserId();
      if (!userId) throw new Error("User ID not found");

      return await createSale(
        userId,
        {
          status: data.status,
          platform: data.platform,
          saleDate: data.saleDate || new Date(),
        },
        data.items.map((item) => ({
          purchaseItemId: item.purchaseItemId,
          quantity: item.quantity,
          salePrice: item.salePrice,
        }))
      );
    },
    onMutate: async (newSale) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: saleKeys.all });

      // Snapshot the previous value
      const previousSales = queryClient.getQueryData(saleKeys.all);

      // Optimistically update to the new value
      queryClient.setQueryData(saleKeys.all, (old: any) => {
        const optimisticSale = {
          id: 'temp-' + Date.now(),
          status: newSale.status,
          platform: newSale.platform,
          saleDate: newSale.saleDate || new Date(),
          items: newSale.items,
          created_at: new Date().toISOString(),
        };
        return old ? [...old, optimisticSale] : [optimisticSale];
      });

      // Return a context object with the snapshotted value
      return { previousSales };
    },
    onError: (err, newSale, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSales) {
        queryClient.setQueryData(saleKeys.all, context.previousSales);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
    },
  });
}

/**
 * Hook for fetching sale items for the sale items table.
 * @param saleId - The ID of the sale to fetch items for.
 * @returns {Object} - The query result containing the sale items.
 */
export function useSaleItemsQuery(saleId: string | null) {
  return useQuery({
    queryKey: saleKeys.items(saleId ?? ""),
    queryFn: async () => {
      if (!saleId) return null;
      const userId = await getUserId();
      return await getSaleItemsForTable(userId, saleId);
    },
    enabled: !!saleId,
  });
}
