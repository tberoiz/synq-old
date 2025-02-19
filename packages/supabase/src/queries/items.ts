import { Item } from "models";
import { createClient } from "../utils/client";

const supabase = createClient();

export const fetchItemsByInventory = async (inventoryId: string): Promise<Item[]> => {

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("inventory_id", inventoryId);

  if (error) throw error;
  return data as Item[];
};

export const createItem = async (data: {
  name: string;
  price: string;
  stock: string; // stock is a number
  platforms?: string[];
  inventoryId: number;
}): Promise<Item> => {
  const { name, price, stock, platforms, inventoryId } = data;

  const { data: newItem, error } = await supabase
    .from("items")
    .insert([
      {
        name,
        price: parseFloat(price), // Convert price to numeric
        stock, // stock is already a number
        platforms: platforms || [], // Default to an empty array if platforms is undefined
        inventory_id: inventoryId,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return newItem as Item;
};
