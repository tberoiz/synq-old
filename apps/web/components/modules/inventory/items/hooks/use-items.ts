import React from 'react';
import { useInfiniteItemsQuery, useItemMutations } from '../queries/items';
import type { ItemTableRow } from '@synq/supabase/types';
import type { ItemFilters } from '../queries/keys';

export function useItems(initialData?: ItemTableRow[]) {
  const [filters, setFilters] = React.useState<ItemFilters>({
    searchTerm: '',
    categoryId: null,
  });

  const infiniteQuery = useInfiniteItemsQuery(filters, initialData);
  const mutations = useItemMutations();

  const allItems = React.useMemo(() => {
    const items = infiniteQuery.data?.pages.flatMap((page) => page.data) ?? [];
    const uniqueItems = new Map<string, ItemTableRow>();
    items.forEach((item) => {
      if (item.item_id) {
        uniqueItems.set(item.item_id, item);
      }
    });
    return Array.from(uniqueItems.values());
  }, [infiniteQuery.data]);

  return {
    items: allItems,
    filters,
    setFilters,
    mutations,
    infiniteQuery: {
      fetchNextPage: infiniteQuery.fetchNextPage,
      hasNextPage: infiniteQuery.hasNextPage,
      isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    },
  };
}
