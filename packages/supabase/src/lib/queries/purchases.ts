import { SupabaseClient } from "@supabase/supabase-js";
import {
  type PurchaseTableRow,
  type PurchaseDetails,
  PurchaseBatch,
} from "../types/purchases";
import { handleSupabaseError } from "../utils/error";
import { PaginatedResponse } from "../types";

const DEFAULT_PAGE_SIZE = 10;

/**
 * Fetches a paginated list of purchases from the `vw_purchases_ui_table` view.
 * @param supabase - The Supabase client instance.
 * @param params - An object containing userId, page, pageSize, and includeArchived flag.
 * @returns {Promise<PaginatedResponse<PurchaseTableRow>>} - A paginated response containing the purchases and total count.
 */
export async function fetchPurchases(
  supabase: SupabaseClient,
  params: {
    userId: string;
    page: number;
    pageSize?: number;
    includeArchived?: boolean;
    searchTerm?: string;
  }
): Promise<PaginatedResponse<PurchaseTableRow>> {
  const pageSize = params.pageSize || DEFAULT_PAGE_SIZE;
  const start = (params.page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from("vw_purchases_ui_table")
    .select("id, user_id, name, created_at, total_cost, status, potential_revenue, actual_revenue")
    .eq("user_id", params.userId)
    .eq("status", params.includeArchived ? "active" : "archived")
    .order("created_at", { ascending: false })
    .range(start, end);

  // Add search filter if searchTerm is provided
  if (params.searchTerm) {
    query = query.ilike("name", `%${params.searchTerm}%`);
  }

  const { data, error, count } = await query;

  if (error) handleSupabaseError(error, "Purchases fetch");

  return { data: data as PurchaseTableRow[], count: count ?? 0 };
}

export type CreatePurchaseParams = {
  name: string;
  userId: string;
  items: Array<{
    item_id: string;
    quantity: number;
    unit_cost: number;
  }>;
};
export async function createPurchase(
  supabase: SupabaseClient,
  params: CreatePurchaseParams,
): Promise<PurchaseBatch> {
  // Create purchase batch
  const { data: batch, error: batchError } = await supabase
    .from("user_purchase_batches")
    .insert({
      name: params.name,
      user_id: params.userId,
    })
    .select()
    .single();

  if (batchError) handleSupabaseError(batchError, "Purchase batch creation");

  // Create purchase items
  const { error: itemsError } = await supabase
    .from("user_purchase_items")
    .insert(
      params.items.map(
        (item: { item_id: string; quantity: number; unit_cost: number }) => ({
          batch_id: batch.id,
          item_id: item.item_id,
          quantity: item.quantity,
          remaining_quantity: item.quantity,
          unit_cost: item.unit_cost,
          user_id: params.userId,
        }),
      ),
    );

  if (itemsError) handleSupabaseError(itemsError, "Purchase items creation");

  return batch;
}

export async function archivePurchase(
  supabase: SupabaseClient,
  purchaseId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_purchase_batches")
    .update({ status: "archived" })
    .eq("id", purchaseId);

  if (error) handleSupabaseError(error, "Purchase archive");
}

export async function restorePurchase(
  supabase: SupabaseClient,
  purchaseId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_purchase_batches")
    .update({ status: "active" })
    .eq("id", purchaseId);

  if (error) handleSupabaseError(error, "Purchase restore");
}

export async function updatePurchaseItem(
  supabase: SupabaseClient,
  itemId: string,
  updates: {
    quantity?: number;
    unit_cost?: number;
  },
): Promise<void> {
  const { error } = await supabase
    .from("user_purchase_items")
    .update({
      ...updates,
      remaining_quantity: updates.quantity,
    })
    .eq("id", itemId);

  if (error) handleSupabaseError(error, "Update purchase item");
}

// export async function deletePurchaseItem(
//   supabase: SupabaseClient,
//   id: string
// ): Promise<boolean> {
//   try {
//     const { error } = await supabase
//       .from("purchase_items")
//       .delete()
//       .eq("id", id);

//     if (error) throw error;

//     return true;
//   } catch (error) {
//     console.error("Error deleting purchase item:", error);
//     return false;
//   }
// } 

export async function addItemToPurchase(
  supabase: SupabaseClient,
  batchId: string,
  itemId: string,
  quantity: number,
  unitCost: number,
  userId: string,
): Promise<void> {
  const { error } = await supabase.from("user_purchase_items").insert({
    batch_id: batchId,
    item_id: itemId,
    quantity,
    remaining_quantity: quantity,
    unit_cost: unitCost,
    user_id: userId,
  });

  if (error) handleSupabaseError(error, "Add item to purchase");
}

export async function fetchPurchaseDetails(
  supabase: SupabaseClient,
  purchaseId: string,
): Promise<PurchaseDetails> {
  const { data, error } = await supabase
    .from("vw_purchases_ui_table")
    .select("*")
    .eq("id", purchaseId)
    .single();

  if (error) handleSupabaseError(error, "Purchase details fetch");
  return data as PurchaseDetails;
}

