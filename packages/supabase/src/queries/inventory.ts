import { Inventory } from "models";
import { createClient } from "../utils/client";
import { getUserId } from "./user";

const supabase = createClient();

export const fetchInventories = async (): Promise<Inventory[]> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("inventories")
    .select("id, user_id, name")
    .eq("user_id", userId)
    .throwOnError();

  if (error) throw error;
  return data as Inventory[];
};

export const createInventory = async (name: string) => {
  const userId = await getUserId();
  const { data, error } = await supabase.from("inventories").insert([{ name, user_id: userId }]);
  if (error) throw error;
  return data;
};

export const deleteInventory = async (id: number) => {
  const userId = await getUserId();
  const { error } = await supabase.from("inventories").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
};
