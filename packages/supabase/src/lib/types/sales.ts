import { z } from "zod";
import type { Database } from "./database.types";

export const SaleStatus = {
  LISTED: "listed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const SalePlatform = {
  EBAY: "ebay",
  AMAZON: "amazon",
  ETSY: "etsy",
  SHOPIFY: "shopify",
  OTHER: "other",
} as const;

export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];
export type SalePlatform = (typeof SalePlatform)[keyof typeof SalePlatform];

export const saleItemSchema = z.object({
  purchaseItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  salePrice: z.number().positive(),
});

export const createSaleSchema = z.object({
  platform: z.enum([
    SalePlatform.EBAY,
    SalePlatform.AMAZON,
    SalePlatform.ETSY,
    SalePlatform.SHOPIFY,
    SalePlatform.OTHER,
  ]),
  status: z
    .enum([SaleStatus.LISTED, SaleStatus.COMPLETED, SaleStatus.CANCELLED])
    .default(SaleStatus.LISTED),
  saleDate: z.date().optional(),
  shippingCost: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  platformFees: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(saleItemSchema).min(1),
});

export const updateSaleSchema = createSaleSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;

export interface SaleItem {
  id: string;
  item_id: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_cost: number;
  total_cost: number;
  profit: number;
  is_archived: boolean;
}

export type SaleView = Database["public"]["Views"]["vw_sales_ui_table"]["Row"];

export interface Sale
  extends Omit<
    SaleView,
    | "items"
    | "id"
    | "user_id"
    | "status"
    | "platform"
    | "sale_date"
    | "shipping_cost"
    | "tax_amount"
    | "platform_fees"
    | "total_items"
    | "total_quantity"
    | "total_cogs"
    | "total_revenue"
    | "net_profit"
    | "created_at"
    | "updated_at"
  > {
  id: string;
  user_id: string;
  status: "listed" | "completed" | "cancelled";
  platform: string;
  sale_date: string;
  shipping_cost: number;
  tax_amount: number;
  platform_fees: number;
  total_items: number;
  total_quantity: number;
  total_cogs: number;
  total_revenue: number;
  net_profit: number;
  created_at: string;
  updated_at: string;
  items: SaleItem[];
}
