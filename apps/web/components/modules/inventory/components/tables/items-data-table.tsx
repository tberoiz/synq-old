"use server";

import { createClient } from "@synq/supabase/server";
import { fetchItemsView, getUserId } from "@synq/supabase/queries";
import { ItemsTableClient } from "./items-table-client";


// TODO: Add pagination
async function getItems() {
  const supabase = await createClient();
  const userId = await getUserId();
  const showArchived = true;

  const items = await fetchItemsView(supabase, {
    userId,
    page: 1,
    includeArchived: showArchived,
  });

  return items?.data ?? [];
}

export default async function ItemsDataTable() {
  const items = await getItems();

  return <ItemsTableClient items={items} />;
}
