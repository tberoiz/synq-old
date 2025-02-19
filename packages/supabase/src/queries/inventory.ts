import { InventoryGroup } from "models";
import { createClient } from "../utils/client";
import { getUserId } from "./user";

const supabase = createClient();

export const fetchInventoryGroups = async (): Promise<InventoryGroup[]> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("inventory_groups")
    .select("id, user_id, name, created_at, updated_at")
    .eq("user_id", userId)
    .throwOnError();

  if (error) throw error;
  return data as InventoryGroup[];
};


export const createInventoryGroup = async (name: string) => {
  const userId = await getUserId();
  const { data, error } = await supabase.from("inventory_groups").insert([{ name, user_id: userId }]);
  if (error) throw error;
  return data;
};


export const deleteInventoryGroup = async (id: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from("inventory_groups")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
};
