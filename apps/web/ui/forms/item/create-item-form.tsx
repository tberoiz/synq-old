"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@synq/ui/use-toast";
import { createItem } from "@synq/supabase/queries/items";
import { fetchInventoryGroups } from "@synq/supabase/queries/inventory";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synq/ui/form";
import { DialogClose, DialogFooter } from "@synq/ui/dialog";
import { Checkbox } from "@synq/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";

// Schema for validation
const itemSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Item name must be at least 2 characters." })
    .max(255, { message: "Item name cannot exceed 255 characters." }),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Invalid price format." })
    .min(1, { message: "Price is required." }),
  stock: z
    .string()
    .regex(/^\d+(\.\d{0,2})?$/, { message: "Invalid stock format." })
    .min(0, { message: "Stock is required." }),
  platforms: z.array(z.string()).optional(),
  inventoryId: z.string().min(1, { message: "Inventory is required." }),
});

type ItemFormValues = z.infer<typeof itemSchema>;

// Platform options
const PLATFORM_OPTIONS = [
  { id: "TCGPlayer", label: "TCGPlayer" },
  { id: "Cardmarket", label: "Cardmarket" },
  { id: "eBay", label: "eBay" },
  { id: "Shopify", label: "Shopify" },
];

export const CreateItemForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: "", price: "", stock: "", platforms: [], inventoryId: "" },
  });

  // Fetch inventories
  const { data: inventories, isLoading: isInventoriesLoading } = useQuery({
    queryKey: ["inventories"],
    queryFn: fetchInventoryGroups,
  });

  const onSubmit = async (data: ItemFormValues) => {
    try {
      await createItem({
        name: data.name,
        price: data.price,
        stock: data.stock,
        platforms: data.platforms,
        inventoryId: Number(data.inventoryId),
      });

      queryClient.invalidateQueries({ queryKey: ["inventory_groups"] });
      form.reset();

      toast({
        title: "Success",
        description: "Item created successfully!",
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
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  placeholder="Item Price"
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
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input placeholder="Stock" {...field} type="number" min="0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inventoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inventory</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an inventory" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isInventoriesLoading ? (
                    <SelectItem value="" disabled>
                      Loading inventories...
                    </SelectItem>
                  ) : (
                    inventories?.map((inventory) => (
                      <SelectItem key={inventory.id} value={String(inventory.id)}>
                        {inventory.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="platforms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platforms</FormLabel>
              <div className="space-y-2">
                {PLATFORM_OPTIONS.map((platform) => (
                  <FormItem
                    key={platform.id}
                    className="flex items-center space-x-2"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(platform.id)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...(field.value || []), platform.id]
                            : field.value?.filter(
                                (value) => value !== platform.id
                              );
                          field.onChange(newValue);
                        }}
                      />
                    </FormControl>
                    <FormLabel>{platform.label}</FormLabel>
                  </FormItem>
                ))}
              </div>
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
          <Button type="submit">Create Item</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
