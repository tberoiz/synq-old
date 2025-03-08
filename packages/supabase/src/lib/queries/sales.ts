import { createClient } from "@synq/supabase/client";
import type { Database } from "@synq/supabase/types";
import type { Sale } from "@synq/supabase/types";

export async function getSales(userId: string): Promise<Sale[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vw_sales_ui_table")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Sale[];
}
