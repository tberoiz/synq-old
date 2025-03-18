import { createClient } from "@synq/supabase/client";
import type { Sale } from "@synq/supabase/types";

export async function getSales(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: "listed" | "completed" | "cancelled";
  },
): Promise<Sale[]> {
  const supabase = createClient();
  let query = supabase
    .from("vw_sales_ui_table")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.limit !== undefined && options?.offset !== undefined) {
    query = query.range(options.offset, options.offset + options.limit - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Sale[];
}

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
): Promise<Sale> {
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

  return newSale as Sale;
}

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
): Promise<Sale> {
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

  return updatedSale as Sale;
}

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
