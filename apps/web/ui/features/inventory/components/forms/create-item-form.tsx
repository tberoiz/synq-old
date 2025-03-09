"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@synq/ui/use-toast";
import { createCustomItem, fetchCategories } from "@synq/supabase/queries";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synq/ui/form";
import {
  DialogClose,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@synq/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";
import { getUserId } from "@synq/supabase/queries";
import { createClient } from "@synq/supabase/client";
import { Plus } from "lucide-react";
import { useState } from "react";

const QUERY_KEYS = {
  CATEGORIES: "user_categories",
  ITEMS: "user_inventory_items",
  ITEMS_VIEW: "vw_items_ui_table",
  PURCHASES: "user_purchases",
  PURCHASE_ITEMS: "user_purchase_items",
} as const;

const itemSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Item name must be at least 2 characters." })
    .max(255, { message: "Item name cannot exceed 255 characters." }),
  default_cogs: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Invalid default COGS format." })
    .min(1, { message: "Default COGS is required." }),
  categoryId: z.string().min(1, { message: "Category is required." }),
  listingPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Invalid listing price format." })
    .min(1, { message: "Listing price is required." }),
  sku: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export const CreateItemForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const supabase = createClient();
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const { data: userId } = useQuery({
    queryKey: ["user_id"],
    queryFn: getUserId,
  });

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      default_cogs: "0",
      categoryId: "",
      listingPrice: "0",
      sku: "",
    },
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => fetchCategories(supabase),
  });

  const onSubmit = async (data: ItemFormValues) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCustomItem(supabase, {
        categoryId: data.categoryId,
        name: data.name,
        sku: data.sku,
        cogs: parseFloat(data.default_cogs),
        listingPrice: parseFloat(data.listingPrice),
        userId,
      });

      await queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey[0];
          return [
            QUERY_KEYS.ITEMS,
            QUERY_KEYS.ITEMS_VIEW,
            QUERY_KEYS.CATEGORIES,
            QUERY_KEYS.PURCHASES,
            QUERY_KEYS.PURCHASE_ITEMS,
          ].includes(queryKey as (typeof QUERY_KEYS)[keyof typeof QUERY_KEYS]);
        },
      });

      form.reset();

      toast({
        title: "Success",
        description:
          "Item created successfully! You can now add stock to this item.",
        variant: "default",
      });

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
        <FormField
          control={form.control}
          name="name"
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

        <FormField
          control={form.control}
          name="default_cogs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Cost of Goods Sold (COGS)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Default Cost of Goods Sold"
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

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex gap-2">
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
                <Dialog
                  open={isCreateCategoryOpen}
                  onOpenChange={setIsCreateCategoryOpen}
                >
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <CreateCategoryForm
                      onSuccess={() => {
                        setIsCreateCategoryOpen(false);
                        queryClient.invalidateQueries({
                          queryKey: [QUERY_KEYS.CATEGORIES],
                          exact: true,
                        });
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Stock Keeping Unit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          <Button type="submit" disabled={!userId}>
            Create Item
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Create Category Form Component
const categorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters." }),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const CreateCategoryForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { toast } = useToast();
  const supabase = createClient();
  const { data: userId } = useQuery({
    queryKey: ["user_id"],
    queryFn: getUserId,
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("user_inventory_groups").insert({
        name: data.name,
        user_id: userId,
      });

      if (error) throw error;

      form.reset();
      toast({
        title: "Success",
        description: "Category created successfully!",
        variant: "default",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={!userId}>
            Create Category
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
