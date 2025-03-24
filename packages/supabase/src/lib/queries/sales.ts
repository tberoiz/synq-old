import { createClient } from "@synq/supabase/client";
import type { SaleTableRow, SaleDetails } from "@synq/supabase/types";
import { PaginatedResponse } from "../types/actions";

// Constants
const DEFAULT_ITEMS_PER_PAGE = 10;

/**
 * Fetches a paginated list of sales from the `vw_sales_ui_table` view.
 * @param userId - The ID of the user whose sales to fetch.
 * @param options - An object containing pagination and filter options.
 * @returns {Promise<PaginatedResponse<SaleTableRow>>} - A paginated response containing the sales and total count.
 */
export async function getSales(
  userId: string,
  options?: {
    page?: number;
    pageSize?: number;
    status?: "listed" | "completed" | "cancelled";
  },
): Promise<PaginatedResponse<SaleTableRow>> {
  const supabase = createClient();
  const pageSize = options?.pageSize || DEFAULT_ITEMS_PER_PAGE;
  const page = options?.page || 1;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from("vw_sales_ui_table")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  // Add pagination
  query = query.range(start, end);

  const { data, error, count } = await query;
  if (error) throw error;

  return { 
    data: data as SaleTableRow[], 
    count: count ?? 0 
  };
}

/**
 * Creates a new sale in the `user_sales` table and its associated items in `user_sale_items`.
 * @param userId - The ID of the user creating the sale.
 * @param sale - The sale details to create.
 * @param items - Array of items to associate with the sale.
 * @returns {Promise<SaleDetails>} - The created sale.
 */
export async function createSale(
  userId: string,
  sale: {
    status: string;
    platform: string;
    saleDate?: Date;
    shippingCost?: number;
    taxAmount?: number;
    platformFees?: number;
    notes?: string | null;
  },
  items: Array<{
    purchaseItemId: string;
    quantity: number;
    salePrice: number;
  }>,
): Promise<SaleDetails> {
  const supabase = createClient();

  const { data: newSale, error: saleError } = await supabase
    .from("user_sales")
    .insert({
      user_id: userId,
      status: sale.status,
      platform: sale.platform,
      sale_date: sale.saleDate || new Date(),
      shipping_cost: sale.shippingCost,
      tax_amount: sale.taxAmount,
      platform_fees: sale.platformFees,
      notes: sale.notes,
    })
    .select()
    .single();

  if (saleError) throw saleError;

  const saleItems = items.map((item) => ({
    user_id: userId,
    sale_id: newSale.id,
    purchase_item_id: item.purchaseItemId,
    sold_quantity: item.quantity,
    sale_price: item.salePrice,
  }));

  const { error: itemsError } = await supabase
    .from("user_sale_items")
    .insert(saleItems);

  if (itemsError) {
    // Rollback sale creation
    await supabase.from("user_sales").delete().eq("id", newSale.id);
    throw itemsError;
  }

  return newSale as SaleDetails;
}

/**
 * Updates an existing sale in the `user_sales` table.
 * @param userId - The ID of the user who owns the sale.
 * @param saleId - The ID of the sale to update.
 * @param updates - The fields to update on the sale.
 * @returns {Promise<SaleDetails>} - The updated sale.
 */
export async function updateSale(
  userId: string,
  saleId: string,
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
  },
): Promise<SaleDetails> {
  const supabase = createClient();

  // Verify ownership
  const { data: existingSale, error: fetchError } = await supabase
    .from("user_sales")
    .select()
    .eq("id", saleId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingSale) {
    throw new Error("Sale not found or unauthorized");
  }

  const updateData: Record<string, any> = {};
  if (updates.status) updateData.status = updates.status;
  if (updates.platform) updateData.platform = updates.platform;
  if (updates.saleDate) updateData.sale_date = updates.saleDate;
  if (typeof updates.shippingCost === "number")
    updateData.shipping_cost = updates.shippingCost;
  if (typeof updates.taxAmount === "number")
    updateData.tax_amount = updates.taxAmount;
  if (typeof updates.platformFees === "number")
    updateData.platform_fees = updates.platformFees;
  if ("notes" in updates) updateData.notes = updates.notes;

  const { data: updatedSale, error: updateError } = await supabase
    .from("user_sales")
    .update(updateData)
    .eq("id", saleId)
    .select()
    .single();

  if (updateError) throw updateError;

  if (updates.items?.length) {
    await supabase.from("user_sale_items").delete().eq("sale_id", saleId);

    const saleItems = updates.items.map((item) => ({
      user_id: userId,
      sale_id: saleId,
      purchase_item_id: item.purchaseItemId,
      sold_quantity: item.quantity,
      sale_price: item.salePrice,
    }));

    const { error: itemsError } = await supabase
      .from("user_sale_items")
      .insert(saleItems);

    if (itemsError) throw itemsError;
  }

  return updatedSale as SaleDetails;
}

/**
 * Deletes a sale from the `user_sales` table.
 * @param userId - The ID of the user who owns the sale.
 * @param saleId - The ID of the sale to delete.
 * @returns {Promise<void>}
 */
export async function deleteSale(
  userId: string,
  saleId: string,
): Promise<void> {
  const supabase = createClient();

  // Verify ownership
  const { data: existingSale, error: fetchError } = await supabase
    .from("user_sales")
    .select()
    .eq("id", saleId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingSale) {
    throw new Error("Sale not found or unauthorized");
  }

  const { error: deleteError } = await supabase
    .from("user_sales")
    .delete()
    .eq("id", saleId);

  if (deleteError) throw deleteError;
}

/**
 * Fetches a single sale by ID from the `vw_sales_ui_table` view.
 * @param userId - The ID of the user who owns the sale.
 * @param saleId - The ID of the sale to fetch.
 * @returns {Promise<SaleDetails>} - The sale details.
 */
export async function getSale(userId: string, saleId: string): Promise<SaleDetails> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vw_sales_ui_table")
    .select("*")
    .eq("id", saleId)
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data as SaleDetails;
}
