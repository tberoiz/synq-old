import { createClient } from "../utils/client";
import { getUserId } from "./user";
import {
  UserAcquisitionBatch,
  UserCategory,
  UserItem,
  UserSupplier,
} from "../models/inventory";
import { TABLES } from "../config/tables";
import { handleSupabaseError } from "../utils/error";
import { cache } from "react";
import { BUCKETS } from "../config/buckets";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient();
const CACHE_TTL = 60 * 5; // 5 minutes cache TTL

// ==================================================================
//                             Categories
// ==================================================================

export const fetchCategories = cache(async (): Promise<UserCategory[]> => {
  try {
    const userId = await getUserId();
    const { data } = await supabase
      .from(TABLES.CATEGORIES)
      .select("id, name, user_id")
      .eq("user_id", userId)
      .throwOnError();

    return data || [];
  } catch (error) {
    throw handleSupabaseError(error, "fetchCategories");
  }
});

// ==================================================================
//                             Suppliers
// ==================================================================

export const fetchSuppliers = cache(async (): Promise<UserSupplier[]> => {
  try {
    const userId = await getUserId();
    const { data } = await supabase
      .from(TABLES.SUPPLIERS)
      .select("id, name, contact_info, created_at, user_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .throwOnError();

    return data || [];
  } catch (error) {
    throw handleSupabaseError(error, "fetchSuppliers");
  }
});

// ==================================================================
//                             Batches
// ==================================================================

export const fetchInventoryBatches = cache(
  async (): Promise<UserAcquisitionBatch[]> => {
    try {
      const userId = await getUserId();
      const { data: batches } = await supabase
        .from(TABLES.ACQUISITION_BATCHES)
        .select(
          `
          id,
          user_id,
          suppliers,
          name,
          created_at,
          updated_at,
          items:${TABLES.INVENTORY_ITEMS}!acquisition_batch_id(
            id,
            cogs,
            quantity,
            listing_price
          )
          `,
        )
        .eq("user_id", userId)
        .throwOnError();

      if (!batches) return [];

      return batches.map((batch) => {
        const items = batch.items || [];
        const total_cogs = items.reduce(
          (sum, item) => sum + item.cogs * item.quantity,
          0,
        );
        const total_listing_price = items.reduce(
          (sum, item) => sum + item.listing_price * item.quantity,
          0,
        );

        return {
          ...batch,
          item_count: items.length,
          total_cogs,
          total_listing_price,
          total_profit: total_listing_price - total_cogs,
        };
      });
    } catch (error) {
      throw handleSupabaseError(error, "fetchInventoryBatches");
    }
  },
);

export const createInventoryBatch = async (
  name: string,
  supplierIds?: string[],
): Promise<UserAcquisitionBatch> => {
  try {
    const userId = await getUserId();
    const { data } = await supabase
      .from(TABLES.ACQUISITION_BATCHES)
      .insert([{ name, user_id: userId, suppliers: supplierIds || [] }])
      .select("*")
      .single()
      .throwOnError();

    return data;
  } catch (error) {
    throw handleSupabaseError(error, "createInventoryBatch");
  }
};

export const deleteInventoryBatch = async (id: string): Promise<void> => {
  try {
    const userId = await getUserId();
    await supabase
      .from(TABLES.ACQUISITION_BATCHES)
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .throwOnError();
  } catch (error) {
    throw handleSupabaseError(error, "deleteInventoryBatch");
  }
};

// ==================================================================
//                          Inventory Items
// ==================================================================

export const fetchAllItems = cache(async (): Promise<UserItem[]> => {
  try {
    const userId = await getUserId();
    const { data } = await supabase
      .from(TABLES.INVENTORY_ITEMS)
      .select(
        `
        id,
        user_id,
        acquisition_batch_id,
        category_id,
        name,
        sku,
        quantity,
        cogs,
        listing_price,
        image_urls,
        created_at,
        updated_at
        `,
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .throwOnError();

    return (data || []).map((item) => ({
      ...item,
      name: item.name || "Unnamed Item",
      // Provide a fallback for updated_at if missing
      updated_at: item.updated_at || item.created_at,
    }));
  } catch (error) {
    throw handleSupabaseError(error, "fetchAllItems");
  }
});

export const createCustomItem = async (
  categoryId: string,
  name: string,
  sku: string = "",
  cogs: number,
  quantity: number,
  listingPrice: number,
  imageUrls?: string[],
): Promise<UserItem> => {
  try {
    const userId = await getUserId();
    const { data } = await supabase
      .from(TABLES.INVENTORY_ITEMS)
      .insert([
        {
          user_id: userId,
          category_id: categoryId,
          name,
          sku,
          cogs,
          quantity,
          listing_price: listingPrice,
          image_urls: imageUrls || [],
        },
      ])
      .select("*")
      .single()
      .throwOnError();

    return data;
  } catch (error) {
    throw handleSupabaseError(error, "createCustomItem");
  }
};

export const deleteInventoryItem = async (itemId: string): Promise<void> => {
  try {
    const userId = await getUserId();
    await supabase
      .from(TABLES.INVENTORY_ITEMS)
      .delete()
      .eq("id", itemId)
      .eq("user_id", userId)
      .throwOnError();
  } catch (error) {
    throw handleSupabaseError(error, "deleteInventoryItem");
  }
};

export const fetchItemsByBatch = cache(
  async (batchId: string): Promise<UserItem[]> => {
    try {
      const userId = await getUserId();
      const { data } = await supabase
        .from(TABLES.INVENTORY_ITEMS)
        .select(
          `
          id,
          user_id,
          acquisition_batch_id,
          category_id,
          name,
          sku,
          quantity,
          cogs,
          listing_price,
          image_urls,
          created_at,
          updated_at
          `,
        )
        .eq("user_id", userId)
        .eq("acquisition_batch_id", batchId)
        .throwOnError();

      return (data || []) as UserItem[];
    } catch (error) {
      throw handleSupabaseError(error, "fetchItemsByBatch");
    }
  },
);

export const fetchUnimportedBatchItems = cache(
  async (batchId: string): Promise<UserItem[]> => {
    try {
      const userId = await getUserId();
      const { data } = await supabase
        .from(TABLES.INVENTORY_ITEMS)
        .select(
          `
          id,
          user_id,
          acquisition_batch_id,
          category_id,
          name,
          sku,
          quantity,
          cogs,
          listing_price,
          image_urls,
          created_at,
          updated_at
          `,
        )
        .eq("user_id", userId)
        .neq("acquisition_batch_id", batchId)
        .throwOnError();

      return data || ([] as UserItem[]);
    } catch (error) {
      throw handleSupabaseError(error, "fetchUnimportedBatchItems");
    }
  },
);

export const importItemsToBatch = async (
  batchId: string,
  itemIds: string[],
): Promise<void> => {
  try {
    const userId = await getUserId();
    await supabase
      .from(TABLES.INVENTORY_ITEMS)
      .update({ acquisition_batch_id: batchId })
      .in("id", itemIds)
      .eq("user_id", userId)
      .throwOnError();
  } catch (error) {
    throw handleSupabaseError(error, "importItemsToBatch");
  }
};

export const updateItem = async (
  itemId: string,
  data: {
    name?: string;
    sku?: string;
    quantity?: number;
    cogs?: number;
    listingPrice?: number;
    categoryId?: string;
    imageUrls?: string[];
  },
): Promise<void> => {
  try {
    await supabase
      .from(TABLES.INVENTORY_ITEMS)
      .update({
        name: data.name,
        sku: data.sku,
        quantity: data.quantity,
        cogs: data.cogs,
        listing_price: data.listingPrice,
        category_id: data.categoryId,
        image_urls: data.imageUrls,
      })
      .eq("id", itemId)
      .throwOnError();
  } catch (error) {
    throw handleSupabaseError(error, "updateItem");
  }
};

// ==================================================================
//                             Images
// ==================================================================

export const uploadImages = async (
  itemId: string,
  files: File[],
): Promise<string[]> => {
  try {
    const userId = await getUserId();
    const newImageUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${uuidv4()}.${fileExt}`;
      const { data: uploadData } = await supabase.storage
        .from(BUCKETS.ITEMS_IMAGES)
        .upload(fileName, file);
      if (!uploadData) {
        throw new Error("Failed to upload image");
      }
      const { data: signedUrlData } = await supabase.storage
        .from(BUCKETS.ITEMS_IMAGES)
        .createSignedUrl(uploadData.path, 3600);
      if (signedUrlData) {
        newImageUrls.push(signedUrlData.signedUrl);
      } else {
        throw new Error("Failed to create signed URL");
      }
    }

    // Append new images to current image_urls
    const { data: currentItem } = await supabase
      .from(TABLES.INVENTORY_ITEMS)
      .select("image_urls")
      .eq("id", itemId)
      .eq("user_id", userId)
      .single();

    const updatedImageUrls = [
      ...(currentItem?.image_urls || []),
      ...newImageUrls,
    ];

    await supabase
      .from(TABLES.INVENTORY_ITEMS)
      .update({ image_urls: updatedImageUrls })
      .eq("id", itemId)
      .eq("user_id", userId);

    return newImageUrls;
  } catch (error) {
    throw handleSupabaseError(error, "uploadImages");
  }
};

export const deleteItemImage = async (
  itemId: string,
  imageUrl: string,
): Promise<void> => {
  try {
    const userId = await getUserId();

    let bucketSegment = "";
    if (imageUrl.includes("/storage/v1/object/sign/item-images/")) {
      bucketSegment = "/storage/v1/object/sign/item-images/";
    } else if (imageUrl.includes("/storage/v1/object/public/item-images/")) {
      bucketSegment = "/storage/v1/object/public/item-images/";
    } else {
      throw new Error(
        "Invalid image URL format. Expected Supabase Storage URL.",
      );
    }

    // Extract the file path and remove any query parameters
    const filePathWithQuery = imageUrl.split(bucketSegment)[1];
    if (!filePathWithQuery) {
      throw new Error("Unable to extract file path from the image URL.");
    }
    // Assert that the first element exists (non-null)
    const filePath = filePathWithQuery.split("?")[0]!;

    const { error: deleteError } = await supabase.storage
      .from(BUCKETS.ITEMS_IMAGES)
      .remove([filePath]);
    if (deleteError) {
      throw deleteError;
    }

    const { data: itemData } = await supabase
      .from(TABLES.INVENTORY_ITEMS)
      .select("image_urls")
      .eq("id", itemId)
      .eq("user_id", userId)
      .single();
    if (!itemData) throw new Error("Item not found");

    const updatedImageUrls =
      itemData.image_urls?.filter((url: string) => url !== imageUrl) || [];

    await supabase
      .from(TABLES.INVENTORY_ITEMS)
      .update({ image_urls: updatedImageUrls })
      .eq("id", itemId)
      .eq("user_id", userId)
      .throwOnError();
  } catch (error) {
    throw handleSupabaseError(error, "deleteItemImage");
  }
};
