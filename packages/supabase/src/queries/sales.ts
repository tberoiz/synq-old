import { createClient } from "../utils/client";
import { getUserId } from "./user";

const supabase = createClient();

export const createSalesBatch = async (name: string) => {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("user_sales_batches")
    .insert([{ name, user_id: userId }])
    .select("*")
    .throwOnError();

  if (error) throw error;

  return data[0];
};
