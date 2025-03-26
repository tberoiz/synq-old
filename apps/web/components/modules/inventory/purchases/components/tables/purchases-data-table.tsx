"use server";

import { createClient } from "@synq/supabase/server";
import { fetchPurchases, getUserId } from "@synq/supabase/queries";
import { PurchasesTableClient } from "./purchases-table-client";

async function getPurchases() {
  const supabase = await createClient();
  const userId = await getUserId();
  const showArchived = true;

  const result = await fetchPurchases(supabase, {
    userId,
    page: 1,
    includeArchived: showArchived,
  });

  return result.data;
}

export default async function PurchasesDataTable() {
  const purchases = await getPurchases();
  return <PurchasesTableClient purchases={purchases} />;
}
