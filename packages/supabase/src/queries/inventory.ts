import { createClient } from "../utils/client";
import { getUserId } from "./user";
import {
  UserAcquisitionBatch,
  UserCategory,
  UserInventory,
  UserSupplier,
} from "../models/inventory";

const supabase = createClient();
/**
 * Fetch all categories for the current user.
 */
export const fetchCategories = async (): Promise<UserCategory[]> => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("user_categories")
    .select("id, name")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }

  return data as UserCategory[];
};

/**
 * Fetch all suppliers for the current user.
 */
export const fetchSuppliers = async (): Promise<UserSupplier[]> => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("user_suppliers")
    .select("id, name, contact_info, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching suppliers:", error);
    throw error;
  }

  return data as UserSupplier[];
};

/**
 * Fetch all batches for the current user.
 */
export const fetchInventoryBatches = async (): Promise<UserAcquisitionBatch[]> => {
  const userId = await getUserId();

  // Fetch batches with their items
  const { data: batches, error: batchesError } = await supabase
    .from("user_acquisition_batches")
    .select(
      `
      id,
      user_id,
      suppliers,
      name,
      created_at,
      user_inventory:user_inventory!acquisition_batch_id (
        id,
        cogs,
        quantity,
        listing_price
      )
      `,
    )
    .eq("user_id", userId)
    .throwOnError();

  if (batchesError) throw batchesError;

  // Fetch all suppliers for the current user
  const { data: suppliers, error: suppliersError } = await supabase
    .from("user_suppliers")
    .select("id, name, contact_info")
    .eq("user_id", userId)
    .throwOnError();

  if (suppliersError) throw suppliersError;

  // Create a map of supplier IDs to supplier details for quick lookup
  const supplierMap = new Map(
    suppliers.map((supplier) => [supplier.id, supplier]),
  );

  // Map batches to include supplier details
  const batchesWithSuppliers = (batches ?? []).map((batch) => {
    const items = batch.user_inventory || [];
    const item_count = items.length;
    const total_cogs = items.reduce(
      (sum, item) => sum + item.cogs * item.quantity,
      0,
    );
    const total_listing_price = items.reduce(
      (sum, item) => sum + (item.listing_price || 0) * item.quantity,
      0,
    );
    const total_profit = total_listing_price - total_cogs;

    // Map supplier IDs to supplier details
    const supplierDetails = batch.suppliers
      .map((supplierId: string) => supplierMap.get(supplierId))
      .filter(Boolean); // Filter out undefined values

    return {
      ...batch,
      item_count,
      total_cogs,
      total_listing_price,
      total_profit,
      suppliers: supplierDetails,
    };
  });

  return batchesWithSuppliers as UserAcquisitionBatch[];
};

/**
 * Fetch all items for the current user.
 */
export const fetchAllItems = async (): Promise<UserInventory[]> => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("user_inventory")
    .select(
      `
      id,
      user_id,
      acquisition_batch_id,
      category_id,
      name,
      quantity,
      cogs,
      listing_price,
      created_at
      `,
    )
    .eq("user_id", userId)
    .throwOnError();

  if (error) throw error;

  return data as UserInventory[];
};

/**
 * Create a new category.
 */
export const createCategory = async (name: string): Promise<UserCategory> => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("user_categories")
    .insert([{ name, user_id: userId }])
    .select("*")
    .throwOnError();

  if (error) throw error;
  return data[0] as UserCategory;
};

/**
 * Create a new supplier.
 */
export const createSupplier = async (
  name: string,
  contact_info?: string,
): Promise<UserSupplier> => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("user_suppliers")
    .insert([{ name, contact_info, user_id: userId }])
    .select("*")
    .throwOnError();

  if (error) throw error;
  return data[0] as UserSupplier;
};

/**
 * Create a custom item.
 */
export const createCustomItem = async (
  categoryId: string,
  name: string,
  cogs: number,
  quantity: number,
  listingPrice: number,
): Promise<UserInventory> => {
  const userId = await getUserId();

  if (
    !categoryId ||
    !name ||
    cogs < 0 ||
    quantity < 0 ||
    listingPrice < 0
  ) {
    throw new Error(
      "Invalid input: Missing required fields or invalid values.",
    );
  }

  const { data, error } = await supabase
    .from("user_inventory")
    .insert([
      {
        user_id: userId,
        category_id: categoryId,
        name: name,
        cogs: cogs,
        quantity: quantity,
        listing_price: listingPrice,
      },
    ])
    .select("*")
    .throwOnError();

  if (error) throw error;

  return data[0] as UserInventory;
};

/**
 * Create an inventory batch.
 */
export const createInventoryBatch = async (
  name: string,
  supplierId?: string,
) => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("user_acquisition_batches")
    .insert([{ name, user_id: userId, supplier_id: supplierId }])
    .select("*")
    .throwOnError();

  if (error) throw error;
  return data;
};

export const deleteInventoryBatch = async (id: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from("user_acquisition_batches")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .throwOnError();

  if (error) throw error;
};

export const deleteInventoryItem = async (itemId: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from("user_inventory")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId)
    .throwOnError();

  if (error) throw error;
};


export const fetchItemsByBatch = async (
  batchId: string,
): Promise<UserInventory[]> => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("user_inventory")
    .select(
      `
      id,
      user_id,
      acquisition_batch_id,
      category_id,
      name,
      quantity,
      cogs,
      listing_price,
      created_at
      `,
    )
    .eq("user_id", userId)
    .eq("acquisition_batch_id", batchId)
    .throwOnError();

  if (error) throw error;

  const items = (data ?? []).map((item: any) => ({
    ...item,
    name: item.name || "Unnamed Item", // Fallback to "Unnamed Item" if name is null or undefined
  }));

  return items as UserInventory[];
};

/**
 * Import selected items into a batch by updating their acquisition_batch_id.
 * @param batchId - The ID of the target batch.
 * @param itemIds - An array of item IDs to import into the batch.
 */
export const importItemsToBatch = async (
  batchId: string,
  itemIds: string[],
): Promise<void> => {
  const userId = await getUserId();

  // Validate input
  if (!batchId || !itemIds || itemIds.length === 0) {
    throw new Error("Invalid input: Missing batch ID or item IDs.");
  }

  // Update the acquisition_batch_id for each item
  const { error } = await supabase
    .from("user_inventory")
    .update({ acquisition_batch_id: batchId })
    .in("id", itemIds)
    .eq("user_id", userId)
    .throwOnError();

  if (error) {
    console.error("Error importing items to batch:", error);
    throw error;
  }

  console.log(`Successfully imported ${itemIds.length} items into batch ${batchId}.`);
};

export const fetchUnimportedCollectionItems = async (
  collectionId: string,
): Promise<UserInventory[]> => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("user_inventory")
    .select(
      `
      id,
      user_id,
      acquisition_batch_id,
      category_id,
      name,
      cogs,
      quantity,
      listing_price,
      created_at
      `,
    )
    .eq("user_id", userId)
    .neq("collection_id", collectionId) // Exclude items already in the collection
    .throwOnError();

  if (error) throw error;

  const items = (data ?? []).map((item: any) => ({
    ...item,
    name: item.name || "Unnamed Item", // Fallback to "Unnamed Item" if name is null or undefined
  }));

  return items as UserInventory[];
};

export const fetchUnimportedBatchItems = async (
  batchId: string,
): Promise<UserInventory[]> => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("user_inventory")
    .select(
      `
      id,
      user_id,
      acquisition_batch_id,
      category_id,
      name,
      cogs,
      quantity,
      listing_price,
      created_at
      `,
    )
    .eq("user_id", userId)
    .neq("acquisition_batch_id", batchId)
    .throwOnError();

  if (error) throw error;

  const items = (data ?? []).map((item: any) => ({
    ...item,
    name: item.name || "Unnamed Item",
  }));

  return items as UserInventory[];
};

export const updateItem = async (
  itemId: string,
  data: {
    name?: string;
    quantity?: number;
    cogs?: number;
    listingPrice?: number;
    categoryId?: string;
  },
) => {
  const { error } = await supabase
    .from("user_inventory")
    .update({
      name: data.name,
      quantity: data.quantity,
      cogs: data.cogs,
      listing_price: data.listingPrice,
      category_id: data.categoryId,
    })
    .eq("id", itemId)
    .throwOnError();

  if (error) throw error;
};
