import { createClient } from "../utils/client";
import { getUserId } from "./user";
import {
  UserAcquisitionBatch,
  UserCollection,
  UserInventory,
} from "../models/inventory";

const supabase = createClient();

/**
 * Fetch all collections for the current user.
 */
export const fetchCollections = async (): Promise<UserCollection[]> => {
  const userId = await getUserId();

  // Fetch collections
  const { data: collections, error: collectionsError } = await supabase
    .from("user_collections")
    .select("id, name, code, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (collectionsError) {
    console.error("Error fetching collections:", collectionsError);
    throw collectionsError;
  }

  // Fetch items for all collections
  const { data: items, error: itemsError } = await supabase
    .from("user_inventory")
    .select("id, collection_id, cogs, quantity, listing_price")
    .eq("user_id", userId);

  if (itemsError) {
    console.error("Error fetching items:", itemsError);
    throw itemsError;
  }

  // Calculate itemCount, totalValue, and totalProfit for each collection
  const collectionsWithStats = collections.map((collection) => {
    const collectionItems = items.filter(
      (item) => item.collection_id === collection.id,
    );

    const itemCount = collectionItems.length;
    const totalValue = collectionItems.reduce(
      (sum, item) => sum + (item.listing_price || 0) * item.quantity,
      0,
    );
    const totalCogs = collectionItems.reduce(
      (sum, item) => sum + item.cogs * item.quantity,
      0,
    );
    const totalProfit = totalValue - totalCogs;

    return {
      ...collection,
      itemCount,
      totalValue,
      totalProfit,
    };
  });

  return collectionsWithStats as UserCollection[];
};

export const fetchItemsByCollection = async (
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
      global_card_id (id, name),
      custom_name,
      cogs,
      quantity,
      listing_price,
      created_at
      `,
    )
    .eq("user_id", userId)
    .eq("collection_id", collectionId)
    .throwOnError();

  if (error) throw error;

  const items = (data ?? []).map((item: any) => ({
    ...item,
    name: item.global_card_id?.name || item.custom_name || "Unnamed Item",
  }));

  return items as UserInventory[];
};

export const createInventoryCollection = async (name: string, code: string) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("user_collections")
    .insert([{ name, code, user_id: userId }])
    .throwOnError();

  if (error) throw error;
  return data;
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
      global_card_id (id, name),
      custom_name,
      cogs,
      quantity,
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
    name: item.global_card_id?.name || item.custom_name || "Unnamed Item",
  }));

  return items as UserInventory[];
};

export const fetchAllItems = async (): Promise<UserInventory[]> => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("user_inventory")
    .select(
      `
      id,
      user_id,
      acquisition_batch_id,
      global_card_id (id, name),
      custom_name,
      cogs,
      quantity,
      listing_price,
      created_at
      `,
    )
    .eq("user_id", userId)
    .throwOnError();

  if (error) throw error;

  const items = (data ?? []).map((item: any) => ({
    ...item,
    name: item.global_card_id?.name || item.custom_name || "Unnamed Item",
  }));

  return items as UserInventory[];
};

export const fetchInventoryBatches = async (): Promise<
  UserAcquisitionBatch[]
> => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("user_acquisition_batches")
    .select(
      `
      id,
      user_id,
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

  if (error) throw error;

  const batches = (data ?? []).map((batch) => {
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

    return {
      ...batch,
      item_count,
      total_cogs,
      total_listing_price,
      total_profit,
    };
  });

  return batches as UserAcquisitionBatch[];
};

export const createInventoryBatch = async (name: string) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("user_acquisition_batches")
    .insert([{ name, user_id: userId }])
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

export const createCustomItem = async (
  acquisitionBatchId: string,
  collectionId: string,
  customName: string,
  cogs: number,
  quantity: number,
  listingPrice: number,
): Promise<UserInventory> => {
  const userId = await getUserId();

  // Validate input
  if (
    !acquisitionBatchId ||
    !collectionId ||
    !customName ||
    cogs < 0 ||
    quantity < 0 ||
    listingPrice < 0
  ) {
    throw new Error(
      "Invalid input: Missing required fields or invalid values.",
    );
  }

  // Insert the manual item into the user_inventory table
  const { data, error } = await supabase
    .from("user_inventory")
    .insert([
      {
        user_id: userId,
        acquisition_batch_id: acquisitionBatchId,
        collection_id: collectionId,
        custom_name: customName,
        cogs: cogs,
        quantity: quantity,
        listing_price: listingPrice,
      },
    ])
    .select("*")
    .throwOnError();

  if (error) throw error;

  // Return the created item
  return data[0] as UserInventory;
};

export const updateItem = async (
  itemId: string,
  data: {
    customName?: string;
    quantity?: number;
    cogs?: number;
    listingPrice?: number;
  },
) => {
  const { error } = await supabase
    .from("user_inventory")
    .update({
      custom_name: data.customName,
      quantity: data.quantity,
      cogs: data.cogs,
      listing_price: data.listingPrice,
    })
    .eq("id", itemId)
    .throwOnError();

  if (error) throw error;
};
