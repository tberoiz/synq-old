"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@synq/ui/use-toast";
import {
  createCustomItem,
  fetchCategories,
} from "@synq/supabase/queries/inventory";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synq/ui/form";
import { DialogClose, DialogFooter } from "@synq/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";

const QUERY_KEYS = {
  INVENTORY_BATCHES: "user_inventory_batches",
  CATEGORIES: "user_categories",
  ITEMS: "user_inventory_items",
};

const itemSchema = z.object({
  customName: z
    .string()
    .min(2, { message: "Item name must be at least 2 characters." })
    .max(255, { message: "Item name cannot exceed 255 characters." }),
  stockQuantity: z
    .string()
    .regex(/^\d+$/, { message: "Stock quantity must be a valid number." })
    .min(1, { message: "Stock quantity is required." }),
  cogs: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Invalid COGS format." })
    .min(1, { message: "COGS is required." }),
  categoryId: z.string().min(1, { message: "Category is required." }),
  listingPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Invalid listing price format." })
    .min(1, { message: "Listing price is required." }),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export const CreateItemForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      customName: "",
      stockQuantity: "",
      cogs: "",
      categoryId: "",
      listingPrice: "",
    },
  });

  const {
    data: categories,
    isLoading: isCategoriesLoading,
  } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: fetchCategories,
  });

  const onSubmit = async (data: ItemFormValues) => {
    try {
      await createCustomItem(
        data.categoryId,
        data.customName,
        parseFloat(data.cogs),
        parseInt(data.stockQuantity, 10),
        parseFloat(data.listingPrice),
      );

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVENTORY_BATCHES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CATEGORIES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ITEMS],
      });

      form.reset();

      // Show success toast
      toast({
        title: "Success",
        description: "Item created successfully!",
        variant: "default",
      });

      // Trigger onSuccess callback if provided
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating item:", error);
      toast({
        title: "Error",
        description: "Failed to create item. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Custom Name */}
        <FormField
          control={form.control}
          name="customName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="Item Name" {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stock Quantity */}
        <FormField
          control={form.control}
          name="stockQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Quantity</FormLabel>
              <FormControl>
                <Input
                  placeholder="Stock Quantity"
                  {...field}
                  type="number"
                  min="1"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* COGS */}
        <FormField
          control={form.control}
          name="cogs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>COGS</FormLabel>
              <FormControl>
                <Input
                  placeholder="Cost of Goods Sold"
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Listing Price */}
        <FormField
          control={form.control}
          name="listingPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Listing Price</FormLabel>
              <FormControl>
                <Input
                  placeholder="Listing Price"
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Selection */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isCategoriesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading categories...
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
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Create Item</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
