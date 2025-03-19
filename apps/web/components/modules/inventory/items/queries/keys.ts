export const itemKeys = {
  all: ["user_inv_items"] as const,
  infinite: (filters: ItemFilters) =>
    [...itemKeys.all, "infinite", filters] as const,
  detail: (id: string) => [...itemKeys.all, id] as const,
  details: (id: string) => ["item_details", id] as const,
} as const;

export const categoryKeys = {
  all: ["inventory_groups"] as const,
} as const;

export interface ItemFilters {
  searchTerm?: string;
  categoryId?: string | null;
  includeArchived?: boolean;
}
