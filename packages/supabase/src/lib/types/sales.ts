import { z } from "zod";

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

/**
 * @interface SaleItem
 * @description Represents a sale item with its details.
 * @table: vw_sale_items_ui_table
 */
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

/**
 * @interface SaleTableRow
 * @description Base type for the sales table.
 * @table: vw_sales_ui_table
 */
export interface SaleTableRow {
  id: string;
  user_id: string;
  status: SaleStatus;
  platform: SalePlatform;
  sale_date: string;
  shipping_cost: number;
  tax_rate: number;
  tax_type: "percentage" | "fixed";
  tax_amount: number;
  platform_fees: number;
  total_items: number;
  total_quantity: number;
  total_cogs: number;
  total_revenue: number;
  net_profit: number;
  created_at: string;
  updated_at: string;
}

/**
 * @interface SaleDetails
 * @description Extended type for the sales details sheet.
 * @table: vw_sales_ui_table
 */
export interface SaleDetails extends SaleTableRow {
  items: SaleItem[];
  notes: string | null;
}

// For backward compatibility
export type Sale = SaleDetails;
