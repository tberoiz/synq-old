import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@synq/supabase/client";
import {
  addItemToPurchase,
  fetchItemsView,
  fetchPurchaseDetails,
  getUserId,
  updatePurchaseItem,
} from "@synq/supabase/queries";
import { purchaseKeys } from "./keys";
import type { PurchaseDetails, ImportItem } from "@synq/supabase/types";

export function usePurchaseDetailsSheetQueries(purchaseId: string | null) {
  const queryClient = useQueryClient();
  const supabase = createClient();

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

  const updateItemMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      quantity: number;
      unit_cost: number;
    }) => {
      return updatePurchaseItem(supabase, data.id, {
        quantity: data.quantity,
        unit_cost: data.unit_cost,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseKeys.all }),
        queryClient.invalidateQueries({
          queryKey: purchaseKeys.details(purchaseId ?? ""),
        }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
        queryClient.invalidateQueries({ queryKey: ["item_details"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory_stats"] }),
        queryClient.invalidateQueries({ queryKey: ["purchase_stats"] }),
      ]);

      queryClient.refetchQueries({
        queryKey: purchaseKeys.details(purchaseId ?? ""),
        exact: true,
      });
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
    updateItem: updateItemMutation.mutateAsync,
    updateName: updateNameMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,
    importItems: importItemsMutation.mutateAsync,
  };
} 
