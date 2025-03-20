import React from 'react';
import { useInfinitePurchasesQuery, usePurchaseMutations } from '../queries/purchases';
import type { PurchaseTableRow } from '@synq/supabase/types';

interface PurchaseFilters {
  searchTerm: string;
}

export function usePurchases(initialData?: PurchaseTableRow[]) {
  const [filters, setFilters] = React.useState<PurchaseFilters>({
    searchTerm: '',
  });

  const infiniteQuery = useInfinitePurchasesQuery(filters, initialData);
  const mutations = usePurchaseMutations();

  const allPurchases = React.useMemo(() => {
    const purchases = infiniteQuery.data?.pages.flatMap((page) => page.data) ?? [];
    const uniquePurchases = new Map<string, PurchaseTableRow>();
    purchases.forEach((purchase) => {
      if (purchase.id) {
        uniquePurchases.set(purchase.id, purchase);
      }
    });
    return Array.from(uniquePurchases.values());
  }, [infiniteQuery.data]);

  return {
    purchases: allPurchases,
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
