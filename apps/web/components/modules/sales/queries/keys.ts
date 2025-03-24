export const saleKeys = {
  all: ["sales"] as const,
  detail: (id: string) => [...saleKeys.all, id] as const,
} as const;
