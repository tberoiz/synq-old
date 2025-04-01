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
    // Create a Map to ensure unique purchases by ID
    const uniquePurchases = new Map<string, PurchaseTableRow>();
    
    // Add initial data if available
    if (initialData) {
      initialData.forEach(purchase => {
        uniquePurchases.set(purchase.id, purchase);
      });
    }

    // Add data from infinite query pages
    infiniteQuery.data?.pages.forEach(page => {
      page.data.forEach(purchase => {
        uniquePurchases.set(purchase.id, purchase);
      });
    });

    // Convert Map values back to array
    return Array.from(uniquePurchases.values());
  }, [infiniteQuery.data, initialData]);

  return {
    purchases,
    setFilters,
    mutations,
    infiniteQuery,
  };
}
