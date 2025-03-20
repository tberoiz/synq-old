export const purchaseKeys = {
  all: ["user_purchases"] as const,
  infinite: (filters: PurchaseFilters) =>
    [...purchaseKeys.all, "infinite", filters] as const,
  detail: (id: string) => [...purchaseKeys.all, id] as const,
  details: (id: string) => ["purchase_details", id] as const,
} as const;

export interface PurchaseFilters {
  searchTerm?: string;
  includeArchived?: boolean;
}
