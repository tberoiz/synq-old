import { SupabaseClient } from "@supabase/supabase-js";
import {
  InventoryGroup
} from "../types/inventory";
import { handleSupabaseError } from "../utils/error";

// Categories
export async function fetchCategories(
  supabase: SupabaseClient,
): Promise<InventoryGroup[]> {
  const { data, error } = await supabase
    .from("user_inventory_groups")
    .select("*")
    .order("name");

  if (error) handleSupabaseError(error, "Categories fetch");
  return data || [];
}




