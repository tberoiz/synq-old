import React from 'react';
import { useInfinitePurchasesQuery, usePurchaseMutations } from '@ui/modules/inventory/purchases/queries/purchases';
import type { PurchaseTableRow } from '@synq/supabase/types';
import type { PurchaseFilters } from '@ui/modules/inventory/purchases/queries/keys';

export function usePurchases(initialData?: PurchaseTableRow[]) {
  const [filters, setFilters] = React.useState<PurchaseFilters>({
    includeArchived: false,
    searchTerm: '',
  });

  const infiniteQuery = useInfinitePurchasesQuery(filters, initialData);
  const mutations = usePurchaseMutations();

  const purchases = React.useMemo(() => {
    return infiniteQuery.data?.pages.flatMap((page) => page.data) ?? [];
  }, [infiniteQuery.data]);

  return {
    purchases,
    setFilters,
    mutations,
    infiniteQuery,
  };
}
