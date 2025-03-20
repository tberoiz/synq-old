import {z} from "zod";

export const UPDATE_ITEM_SCHEMA = z.object({
    name: z.string().min(2),
    sku: z
        .string()
        .optional()
        .transform((val) => val || null),
    listing_price: z.number().min(0),
    default_cogs: z.number().min(0),
    inventory_group_id: z.string().min(1),
});

