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
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { UserInventory } from "@synq/supabase/models/inventory";
import { updateItem, fetchCategories } from "@synq/supabase/queries/inventory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";

// Validation Schema
const itemSchema = z.object({
  name: z.string().min(2, { message: "Item name must be at least 2 characters." }),
  quantity: z.number().min(0, { message: "Quantity must be at least 0." }),
  cogs: z.number().min(0, { message: "COGS must be at least 0." }),
  listingPrice: z.number().min(0, { message: "Listing price must be at least 0." }),
  categoryId: z.string().min(1, { message: "Category is required." }),
});

export default function ItemDetailsSheetContent({
  item,
}: {
  item: UserInventory | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories for the dropdown
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["user_categories"],
    queryFn: fetchCategories,
  });

  // Form state
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: item?.name || "",
      quantity: item?.quantity || 0,
      cogs: item?.cogs || 0,
      listingPrice: item?.listing_price || 0,
      categoryId: item?.category_id || "",
    },
  });

  // Form submission handler
  const onSubmit = async (data: any) => {
    if (!item) return;

    try {
      // Update the item in the database
      await updateItem(item.id, {
        name: data.name,
        quantity: data.quantity,
        cogs: data.cogs,
        listingPrice: data.listingPrice,
        categoryId: data.categoryId,
      });

      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["user_inventory_items"] });
      queryClient.invalidateQueries({ queryKey: ["user_inventory_collections"] });
      queryClient.invalidateQueries({ queryKey: ["user_inventory_batch"] });

      // Show success toast
      toast({
        title: "Success",
        description: "Item updated successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating item:", error);

      // Show error toast
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!item) return <div className="p-4 text-center">Item not found</div>;

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
        {/* Image Grid */}
        {/* <div className="grid grid-cols-2 gap-2 p-4">
          {item.images?.map((image, index) => ( // Use item.images if available
            <div key={index} className="aspect-square overflow-hidden rounded-lg">
              <img
                src={image}
                alt={`Item Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div> */}

        <SheetHeader className="p-4">
          <SheetTitle className="flex items-center gap-2">
            <Tag className="h-6 w-6" />
            <div>
              <div className="text-lg font-medium">{item.name}</div>
              <div className="text-sm text-muted-foreground">
                Created: {format(new Date(item.created_at), "MMM dd, yyyy")}
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Editable Fields */}
        <div className="grid grid-cols-2 gap-4 p-4">
          {/* Item Name */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Item Name</label>
            <Input
              {...register("name")}
              placeholder="Item Name"
              autoComplete="off"
              className="w-full"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
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
              <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>
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
            <label className="block text-sm font-medium mb-1">Listing Price</label>
            <Input
              {...register("listingPrice", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-full"
            />
            {errors.listingPrice && (
              <p className="text-red-500 text-xs mt-1">{errors.listingPrice.message}</p>
            )}
          </div>

          {/* Category Selection */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select
              onValueChange={(value) => setValue("categoryId", value)}
              defaultValue={item.category_id || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {isCategoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : categoriesError ? (
                  <SelectItem value="error" disabled>
                    Failed to load categories.
                  </SelectItem>
                ) : (
                  categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="sticky bottom-0 bg-background border-t p-4">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Updating..." : "Update Item"}
          </Button>
        </SheetFooter>
      </form>
    </div>
  );
}
