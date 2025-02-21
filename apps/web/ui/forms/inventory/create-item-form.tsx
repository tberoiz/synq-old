"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@synq/ui/use-toast";
import {
  fetchInventoryBatches,
  createCustomItem,
  fetchCollections,
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

// Define query keys as constants
const QUERY_KEYS = {
  INVENTORY_BATCHES: "user_inventory_batches",
  COLLECTIONS: "user_inventory_collections",
  ITEMS: "user_inventory_items",
};

// Updated schema for manual items
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
  acquisitionBatchId: z
    .string()
    .min(1, { message: "Acquisition batch is required." }),
  collectionId: z.string().min(1, { message: "Collection is required." }),
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
      acquisitionBatchId: "",
      collectionId: "",
      listingPrice: "",
    },
  });

  // Fetch acquisition batches
  const {
    data: acquisitionBatches,
    isLoading: isAcquisitionBatchesLoading,
    error: acquisitionBatchesError,
  } = useQuery({
    queryKey: [QUERY_KEYS.INVENTORY_BATCHES],
    queryFn: fetchInventoryBatches,
  });

  // Fetch collections
  const {
    data: collections,
    isLoading: isCollectionsLoading,
    error: collectionsError,
  } = useQuery({
    queryKey: [QUERY_KEYS.COLLECTIONS],
    queryFn: fetchCollections,
  });

  // Handle query errors
  if (acquisitionBatchesError) {
    toast({
      title: "Error",
      description: "Failed to load acquisition batches.",
      variant: "destructive",
    });
  }

  if (collectionsError) {
    toast({
      title: "Error",
      description: "Failed to load collections.",
      variant: "destructive",
    });
  }

  const onSubmit = async (data: ItemFormValues) => {
    try {
      await createCustomItem(
        data.acquisitionBatchId,
        data.collectionId,
        data.customName,
        parseFloat(data.cogs),
        parseInt(data.stockQuantity, 10),
        parseFloat(data.listingPrice),
      );

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVENTORY_BATCHES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.COLLECTIONS],
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

        {/* Acquisition Batch Selection */}
        <FormField
          control={form.control}
          name="acquisitionBatchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acquisition Batch</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an acquisition batch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isAcquisitionBatchesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading acquisition batches...
                    </SelectItem>
                  ) : (
                    acquisitionBatches?.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Collection Selection */}
        <FormField
          control={form.control}
          name="collectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collection</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isCollectionsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading collections...
                    </SelectItem>
                  ) : (
                    collections?.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        {collection.name}
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
