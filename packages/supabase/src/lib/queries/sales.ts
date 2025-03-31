import { createClient } from "@synq/supabase/client";
import type { SaleTableRow, SaleDetails, SaleItemWithDetails } from "@synq/supabase/types";
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
 * Updates a sale in the `user_sales` table.
 * If sale items updates are provided, new sale items will be inserted.
 * @param userId - The ID of the user who owns the sale.
 * @param saleId - The ID of the sale to update.
 * @param updates - The updates to apply to the sale.
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
      id?: string;
      purchaseItemId: string;
      quantity: number;
      salePrice: number;
    }>;
  },
): Promise<SaleDetails> {
  const supabase = createClient();

  // Only update sale record if there are sale updates
  if (updates.status || updates.platform || updates.saleDate || 
      typeof updates.shippingCost === "number" || 
      typeof updates.taxAmount === "number" || 
      typeof updates.platformFees === "number" || 
      "notes" in updates) {
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

    const { error: updateError } = await supabase
      .from("user_sales")
      .update(updateData)
      .eq("id", saleId);

    if (updateError) throw updateError;
  }

  // Handle items update if present
  if (updates.items?.length) {
    // Separate items into new items and existing items
    const newItems = updates.items.filter(item => !item.id);
    const existingItems = updates.items.filter(item => item.id);
    
    // Insert new items
    if (newItems.length > 0) {
      const saleItems = newItems.map((item) => ({
        user_id: userId,
        sale_id: saleId,
        purchase_item_id: item.purchaseItemId,
        sold_quantity: item.quantity,
        sale_price: item.salePrice,
      }));

      const { error: newItemsError } = await supabase
        .from("user_sale_items")
        .insert(saleItems);

      if (newItemsError) throw newItemsError;
    }
    
    // Update existing items
    if (existingItems.length > 0) {
      // Process updates one by one to avoid conflicts
      for (const item of existingItems) {
        const { error: updateItemError } = await supabase
          .from("user_sale_items")
          .update({
            sold_quantity: item.quantity,
            sale_price: item.salePrice,
          })
          .eq("id", item.id)
          .eq("user_id", userId);
          
        if (updateItemError) throw updateItemError;
      }
    }
  }

  // Fetch and return the updated sale
  const { data: updatedSale, error: finalFetchError } = await supabase
    .from("vw_sales_ui_table")
    .select("*")
    .eq("id", saleId)
    .single();

  if (finalFetchError) throw finalFetchError;
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
 * @returns {Promise<SaleDetails | null>} - The sale details or null if not found.
 */
export async function getSale(userId: string, saleId: string): Promise<SaleDetails | null> {
  const supabase = createClient();
  
  // First fetch the sale details
  const { data: saleData, error: saleError } = await supabase
    .from("user_sales")
    .select("*")
    .eq("id", saleId)
    .eq("user_id", userId)
    .single();

  if (saleError) {
    if (saleError.code === "PGRST116") {
      return null;
    }
    throw saleError;
  }

  // Then fetch the sale items with their details
  const { data: itemsData, error: itemsError } = await supabase
    .from("user_sale_items")
    .select(`
      *,
      purchase_item:user_purchase_items (
        *,
        item:user_inventory_items (
          id,
          name,
          sku,
          inventory_group_id,
          listing_price
        )
      )
    `)
    .eq("sale_id", saleId)
    .eq("user_id", userId);

  if (itemsError) {
    throw itemsError;
  }

  console.log('Items data:', JSON.stringify(itemsData, null, 2));

  // Transform the data to match SaleDetails type
  const items = itemsData.map(item => {
    console.log('Processing item:', JSON.stringify(item, null, 2));
    return {
      id: item.id,
      item_id: item.purchase_item.item.id,
      name: item.purchase_item.item.name,
      sku: item.purchase_item.item.sku,
      quantity: item.sold_quantity,
      unit_price: item.sale_price || item.purchase_item.item.listing_price,
      total_price: item.sold_quantity * (item.sale_price || item.purchase_item.item.listing_price),
      unit_cost: item.purchase_item.unit_cost,
      total_cost: item.sold_quantity * item.purchase_item.unit_cost,
      profit: item.sold_quantity * ((item.sale_price || item.purchase_item.item.listing_price) - item.purchase_item.unit_cost),
      is_archived: false,
      purchase_item: {
        id: item.purchase_item.id,
        remaining_quantity: item.purchase_item.remaining_quantity,
        unit_cost: item.purchase_item.unit_cost
      }
    };
  });

  // Calculate totals
  const total_revenue = items.reduce((sum, item) => sum + item.total_price, 0);
  const total_cogs = items.reduce((sum, item) => sum + item.total_cost, 0);
  const total_items = items.length;
  const total_quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const net_profit = total_revenue - total_cogs - (saleData.shipping_cost || 0) - (saleData.tax_amount || 0) - (saleData.platform_fees || 0);

  const transformedData = {
    id: saleId,
    user_id: userId,
    status: saleData.status,
    platform: saleData.platform,
    sale_date: saleData.sale_date,
    shipping_cost: saleData.shipping_cost,
    tax_amount: saleData.tax_amount,
    tax_rate: saleData.tax_rate || 0,
    tax_type: saleData.tax_type || "percentage",
    platform_fees: saleData.platform_fees,
    notes: saleData.notes,
    created_at: saleData.created_at,
    updated_at: saleData.updated_at,
    items,
    total_revenue,
    total_cogs,
    total_items,
    total_quantity,
    net_profit
  };

  return transformedData as SaleDetails;
}

/**
 * Fetches sale items data for a specific sale, including purchase and inventory details.
 * This is optimized for the sale items table display.
 * @param userId - The ID of the user who owns the sale.
 * @param saleId - The ID of the sale to fetch items for.
 * @returns {Promise<Array<SaleItemWithDetails>>} - Array of sale items with their details.
 */
export async function getSaleItemsForTable(
  userId: string,
  saleId: string
): Promise<Array<SaleItemWithDetails>> {
  const supabase = createClient();

  const { data: itemsData, error: itemsError } = await supabase
    .from("user_sale_items")
    .select(`
      id,
      user_id,
      sale_id,
      purchase_item_id,
      sold_quantity,
      sale_price,
      created_at,
      purchase_item:user_purchase_items (
        id,
        batch_id,
        item_id,
        quantity,
        remaining_quantity,
        unit_cost,
        purchase:user_purchase_batches (
          id,
          name,
          created_at
        ),
        item:user_inventory_items (
          id,
          name,
          sku,
          inventory_group_id
        )
      )
    `)
    .eq("sale_id", saleId)
    .eq("user_id", userId);

  if (itemsError) {
    throw itemsError;
  }

  return (itemsData as any[]).map(item => ({
    id: item.id,
    user_id: item.user_id,
    sale_id: item.sale_id,
    purchase_item_id: item.purchase_item_id,
    sold_quantity: item.sold_quantity,
    sale_price: item.sale_price,
    created_at: item.created_at,
    purchase_item: {
      id: item.purchase_item.id,
      purchase_id: item.purchase_item.batch_id,
      item_id: item.purchase_item.item_id,
      quantity: item.purchase_item.quantity,
      remaining_quantity: item.purchase_item.remaining_quantity,
      unit_cost: item.purchase_item.unit_cost,
      purchase: {
        id: item.purchase_item.purchase.id,
        purchase_date: item.purchase_item.purchase.created_at
      },
      item: {
        id: item.purchase_item.item.id,
        item_name: item.purchase_item.item.name,
        sku: item.purchase_item.item.sku,
        category: item.purchase_item.item.inventory_group_id
      }
    }
  }));
}
