export const saleKeys = {
  all: ["sales"] as const,
  detail: (id: string) => ["sales", id] as const,
  items: (id: string) => ["sales", id, "items"] as const,
} as const;
