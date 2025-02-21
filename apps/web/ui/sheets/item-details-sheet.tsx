"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { SheetHeader, SheetTitle, SheetFooter } from "@synq/ui/sheet";
import { Tag } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@synq/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { UserInventory } from "@synq/supabase/models/inventory";
import { updateItem } from "@synq/supabase/queries/inventory";

// Validation Schema
const itemSchema = z.object({
  customName: z
    .string()
    .min(2, { message: "Item name must be at least 2 characters." }),
  quantity: z.number().min(0, { message: "Quantity must be at least 0." }),
  cogs: z.number().min(0, { message: "COGS must be at least 0." }),
  listingPrice: z
    .number()
    .min(0, { message: "Listing price must be at least 0." }),
});

export default function ItemDetailsSheetContent({
  item,
}: {
  item: UserInventory | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      customName: item?.custom_name || "",
      quantity: item?.quantity || 0,
      cogs: item?.cogs || 0,
      listingPrice: item?.listing_price || 0,
    },
  });

  // Form submission handler
  const onSubmit = async (data: any) => {
    if (!item) return;

    try {
      await updateItem(item.id, {
        customName: data.customName,
        quantity: data.quantity,
        cogs: data.cogs,
        listingPrice: data.listingPrice,
      });

      queryClient.invalidateQueries({ queryKey: ["user_inventory_items"] });
      queryClient.invalidateQueries({
        queryKey: ["user_inventory_collections"],
      });
      queryClient.invalidateQueries({ queryKey: ["user_inventory_batch"] });

      toast({
        title: "Success",
        description: "Item updated successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!item) return <div className="p-4 text-center">Item not found</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Tag className="h-6 w-6" />
          <div>
            <div className="text-lg font-medium">{item.custom_name}</div>
            <div className="text-sm text-muted-foreground">
              Created: {format(new Date(item.created_at), "MMM dd, yyyy")}
            </div>
          </div>
        </SheetTitle>
      </SheetHeader>

      {/* Editable Fields */}
      <div className="grid grid-cols-2 gap-4 py-4">
        {/* Custom Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Item Name</label>
          <Input
            {...register("customName")}
            placeholder="Item Name"
            autoComplete="off"
            className="w-full"
          />
          {errors.customName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.customName.message}
            </p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <Input
            {...register("quantity", { valueAsNumber: true })}
            type="number"
            min="0"
            className="w-full"
          />
          {errors.quantity && (
            <p className="text-red-500 text-xs mt-1">
              {errors.quantity.message}
            </p>
          )}
        </div>

        {/* COGS */}
        <div>
          <label className="block text-sm font-medium mb-1">COGS (Cost)</label>
          <Input
            {...register("cogs", { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            className="w-full"
          />
          {errors.cogs && (
            <p className="text-red-500 text-xs mt-1">{errors.cogs.message}</p>
          )}
        </div>

        {/* Listing Price */}
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Listing Price
          </label>
          <Input
            {...register("listingPrice", { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            className="w-full"
          />
          {errors.listingPrice && (
            <p className="text-red-500 text-xs mt-1">
              {errors.listingPrice.message}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <SheetFooter className="flex-row gap-2 justify-end grow">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Item"}
        </Button>
      </SheetFooter>
    </form>
  );
}
