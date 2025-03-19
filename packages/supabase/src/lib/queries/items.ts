import { SupabaseClient } from "@supabase/supabase-js";
import { PaginatedResponse } from "../types/actions";
import {
  ItemDetails,
  ItemUpdateParams,
  ItemTableRow,
  TransformedPurchaseBatch,
} from "lib/types/items";
import { handleSupabaseError } from "../utils/error";

// Constants
const DEFAULT_ITEMS_PER_PAGE = 10;

/**
 * Fetches a paginated list of items from the `vw_items_ui_table` view.
 * @param supabase - The Supabase client instance.
 * @param params - An object containing userId, page, pageSize, and includeArchived flag.
 * @returns {Promise<PaginatedResponse<ItemTableRow>>} - A paginated response containing the items and total count.
 */
export async function fetchItemsView(
  supabase: SupabaseClient,
  params: {
    userId: string;
    page: number;
    pageSize?: number;
    includeArchived?: boolean;
    searchTerm?: string;
    categoryId?: string | null;
  },
): Promise<PaginatedResponse<ItemTableRow>> {
  const pageSize = params.pageSize || DEFAULT_ITEMS_PER_PAGE;
  const start = (params.page - 1) * pageSize;
  const end = start + pageSize - 1;

  try {
    // Build the query
    let query = supabase
      .from("vw_items_ui_table")
      .select(
        `item_id, item_name, sku, category, listing_price, is_archived, total_quantity, total_sold`,
        {
          count: "exact",
        },
      )
      .eq("user_id", params.userId);

    // Add archived filter if specified
    if (!params.includeArchived) {
      query = query.eq("is_archived", false);
    }

    // Add search filter if searchTerm is provided
    if (params.searchTerm) {
      query = query.ilike("item_name", `%${params.searchTerm}%`);
    }

    // Add category filter if categoryId is provided
    if (params.categoryId) {
      query = query.eq("inventory_group_id", params.categoryId);
    }

    // Add ordering and pagination
    query = query.order("item_name").range(start, end);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      // Handle pagination range error
      if (error.code === "PGRST103") {
        // If we're requesting a page beyond the available data, return the last available page
        const totalPages = Math.ceil((count ?? 0) / pageSize);
        const lastPage = Math.max(1, totalPages);

        if (params.page > lastPage) {
          // Recursive call to fetch the last available page
          return fetchItemsView(supabase, {
            ...params,
            page: lastPage,
          });
        }
      }

      console.error("Supabase query error:", {
        error,
        params,
        queryDetails: {
          table: "vw_items_ui_table",
          filters: {
            userId: params.userId,
            includeArchived: params.includeArchived,
            searchTerm: params.searchTerm,
            categoryId: params.categoryId,
          },
          pagination: {
            start,
            end,
            pageSize,
            currentPage: params.page,
            totalCount: count,
          },
        },
      });
      handleSupabaseError(error, "Items fetch");
    }

    return { data: data as ItemTableRow[], count: count ?? 0 };
  } catch (error) {
    console.error("Error in fetchItemsView:", {
      error,
      params,
    });
    throw error;
  }
}

/**
 * Fetches detailed information about a specific item from the `vw_items_ui_table` view.
 * @param supabase - The Supabase client instance.
 * @param itemId - The ID of the item to fetch details for.
 * @returns {Promise<ItemDetails>} - The detailed information about the item.
 */
export async function fetchItemDetails(
  supabase: SupabaseClient,
  itemId: Pick<ItemDetails, "item_id">,
): Promise<ItemDetails> {
  const { data, error } = await supabase
    .from("vw_items_ui_table")
    .select("*")
    .eq("item_id", itemId.item_id)
    .single();

  if (error) handleSupabaseError(error, "Item details fetch");

  return {
    ...data,
    purchase_batches: _transformPurchaseBatches(data.purchase_batches),
  };
}

type CreateItemParams = {
  categoryId: string;
  name: string;
  sku?: string;
  cogs: number;
  listingPrice: number;
  userId: string;
};

/**
 * Creates a item in the `user_inventory_items` table.
 * @param supabase - The Supabase client instance.
 * @param params - The params of the item to create.
 * @returns {Promise<void>}
 */
export async function createItem(
  supabase: SupabaseClient,
  params: CreateItemParams,
): Promise<void> {
  const { error } = await supabase.from("user_inventory_items").insert({
    user_id: params.userId,
    inventory_group_id: params.categoryId,
    name: params.name,
    sku: params.sku,
    default_cogs: params.cogs,
    listing_price: params.listingPrice,
    is_archived: false,
  });

  if (error) handleSupabaseError(error, "Item creation");
}

/**
 * Updates the details of a specific item in the `user_inventory_items` table.
 * @param supabase - The Supabase client instance.
 * @param itemId - The ID of the item to update.
 * @param updates - An object containing the fields to update.
 * @returns {Promise<void>}
 */
export async function updateItemDetails(
  supabase: SupabaseClient,
  itemId: Pick<ItemDetails, "item_id">,
  updates: ItemUpdateParams,
): Promise<void> {
  const { error } = await supabase
    .from("user_inventory_items")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId.item_id);

  if (error) handleSupabaseError(error, "Item update");
}

/**
 * Archives an item from the `user_inventory_items` table.
 * @param supabase - The Supabase client instance.
 * @param itemId - The ID of the item to update.
 * @returns {Promise<void>}
 */
export async function archiveItem(
  supabase: SupabaseClient,
  itemId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_inventory_items")
    .update({ is_archived: true })
    .eq("id", itemId);

  if (error) handleSupabaseError(error, "Item archive");
}

/**
 * Restore an item from the `user_inventory_items` table.
 * @param supabase - The Supabase client instance.
 * @param itemId - The ID of the item to update.
 * @returns {Promise<void>}
 */
export async function restoreItem(
  supabase: SupabaseClient,
  itemId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_inventory_items")
    .update({ is_archived: false })
    .eq("id", itemId);

  if (error) handleSupabaseError(error, "Item restore");
}

/**
 * Transforms purchase batches into a standardized format.
 * @param batches - An array of purchase batches or null.
 * @returns {TransformedPurchaseBatch[]} - An array of transformed purchase batches.
 */
function _transformPurchaseBatches(
  batches: Array<{
    batch_id: string;
    name: string;
    quantity: number;
    unit_cost: number;
    created_at: string;
  }> | null,
): TransformedPurchaseBatch[] {
  return (
    batches?.map((batch) => ({
      id: batch.batch_id,
      name: batch.name,
      quantity: batch.quantity,
      unit_cost: batch.unit_cost,
      created_at: batch.created_at,
    })) || []
  );
}


