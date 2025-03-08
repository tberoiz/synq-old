"use server";

import { createSafeActionClient } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { createClient } from "@synq/supabase/server";
import { getUserId } from "@synq/supabase/queries";
import { createSaleSchema, updateSaleSchema } from "@synq/supabase/types";
import { z } from "zod";
import type { ActionResponse } from "@synq/supabase/types";

const action = createSafeActionClient();

export const createSale = action
  .schema(createSaleSchema)
  .action(async ({ parsedInput }): Promise<ActionResponse> => {
    if (!parsedInput.items?.length) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please add at least one item to the sale.",
        },
      };
    }

    try {
      const supabase = await createClient();
      const userId = await getUserId();

      const { data: sale, error: saleError } = await supabase
        .from("user_sales")
        .insert({
          user_id: userId,
          status: parsedInput.status,
          platform: parsedInput.platform,
          sale_date: parsedInput.saleDate || new Date(),
          shipping_cost: parsedInput.shippingCost,
          tax_amount: parsedInput.taxAmount,
          platform_fees: parsedInput.platformFees,
          notes: parsedInput.notes,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert sale items
      const saleItems = parsedInput.items.map((item) => ({
        user_id: userId,
        sale_id: sale.id,
        purchase_item_id: item.purchaseItemId,
        sold_quantity: item.quantity,
        sale_price: item.salePrice,
      }));

      const { error: itemsError } = await supabase
        .from("user_sale_items")
        .insert(saleItems);

      if (itemsError) {
        // Rollback sale creation
        await supabase.from("user_sales").delete().eq("id", sale.id);
        throw itemsError;
      }

      revalidatePath("/sales");
      return { success: true, data: sale };
    } catch (error) {
      console.error("Error creating sale:", error);
      return {
        success: false,
        error: {
          code: "CREATE_SALE_ERROR",
          message: "Failed to create sale. Please try again.",
        },
      };
    }
  });

export const updateSale = action
  .schema(updateSaleSchema)
  .action(async ({ parsedInput }): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();
      const userId = await getUserId();

      // First, verify the sale belongs to the user
      const { data: existingSale, error: fetchError } = await supabase
        .from("user_sales")
        .select()
        .eq("id", parsedInput.id)
        .eq("user_id", userId)
        .single();

      if (fetchError || !existingSale) {
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Sale not found or unauthorized",
          },
        };
      }

      // Update sale details
      const updateData: Partial<{
        status: string;
        platform: string;
        sale_date: Date;
        shipping_cost: number;
        tax_amount: number;
        platform_fees: number;
        notes: string | null;
      }> = {};

      if (parsedInput.status) updateData.status = parsedInput.status;
      if (parsedInput.platform) updateData.platform = parsedInput.platform;
      if (parsedInput.saleDate) updateData.sale_date = parsedInput.saleDate;
      if (typeof parsedInput.shippingCost === "number")
        updateData.shipping_cost = parsedInput.shippingCost;
      if (typeof parsedInput.taxAmount === "number")
        updateData.tax_amount = parsedInput.taxAmount;
      if (typeof parsedInput.platformFees === "number")
        updateData.platform_fees = parsedInput.platformFees;
      if ("notes" in parsedInput) updateData.notes = parsedInput.notes || null;

      const { data: updatedSale, error: updateError } = await supabase
        .from("user_sales")
        .update(updateData)
        .eq("id", parsedInput.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // If items are provided, update them
      if (parsedInput.items?.length) {
        // Delete existing items
        await supabase
          .from("user_sale_items")
          .delete()
          .eq("sale_id", parsedInput.id);

        // Insert new items
        const saleItems = parsedInput.items.map((item) => ({
          user_id: userId,
          sale_id: parsedInput.id,
          purchase_item_id: item.purchaseItemId,
          sold_quantity: item.quantity,
          sale_price: item.salePrice,
        }));

        const { error: itemsError } = await supabase
          .from("user_sale_items")
          .insert(saleItems);

        if (itemsError) throw itemsError;
      }

      revalidatePath("/sales");
      return { success: true, data: updatedSale };
    } catch (error) {
      console.error("Error updating sale:", error);
      return {
        success: false,
        error: {
          code: "UPDATE_SALE_ERROR",
          message: "Failed to update sale. Please try again.",
        },
      };
    }
  });

export const deleteSale = action
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();
      const userId = await getUserId();

      // Verify the sale belongs to the user
      const { data: existingSale, error: fetchError } = await supabase
        .from("user_sales")
        .select()
        .eq("id", parsedInput.id)
        .eq("user_id", userId)
        .single();

      if (fetchError || !existingSale) {
        return {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Sale not found or unauthorized",
          },
        };
      }

      const { error: deleteError } = await supabase
        .from("user_sales")
        .delete()
        .eq("id", parsedInput.id);

      if (deleteError) throw deleteError;

      revalidatePath("/sales");
      return { success: true };
    } catch (error) {
      console.error("Error deleting sale:", error);
      return {
        success: false,
        error: {
          code: "DELETE_SALE_ERROR",
          message: "Failed to delete sale. Please try again.",
        },
      };
    }
  });

export const getSales = action
  .schema(
    z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      status: z.enum(["listed", "completed", "cancelled"]).optional(),
    }),
  )
  .action(async ({ parsedInput }): Promise<ActionResponse> => {
    try {
      const supabase = await createClient();
      const userId = await getUserId();

      let query = supabase
        .from("vw_sales_ui_table")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(
          parsedInput.offset || 0,
          (parsedInput.offset || 0) + (parsedInput.limit || 10) - 1,
        );

      if (parsedInput.status) {
        query = query.eq("status", parsedInput.status);
      }

      const { data: sales, error } = await query;

      if (error) throw error;

      return { success: true, data: sales };
    } catch (error) {
      console.error("Error fetching sales:", error);
      return {
        success: false,
        error: {
          code: "FETCH_SALES_ERROR",
          message: "Failed to fetch sales. Please try again.",
        },
      };
    }
  });
