"use client";

// REACT
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import React from "react";

// FORM
import { UPDATE_ITEM_SCHEMA } from "@ui/modules/inventory/items/queries/schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// API
import { type ItemDetails } from "@synq/supabase/types";
import { useItemMutations } from "@ui/modules/inventory/items/queries/items";

// UI COMPONENTS
import { Form } from "@synq/ui/form";
import { Label } from "@synq/ui/label";
import { useToast } from "@synq/ui/use-toast";

// SHARED COMPONENTS
import { NumberInput } from "@ui/shared/forms/number-input";
import { TextInput } from "@ui/shared/forms/text-input";
import { SelectInput } from "@ui/shared/forms/select-input";
import { PurchaseBatchCard } from "@ui/modules/inventory/items/components/cards/purchase-batch-card";

interface EditItemFormProps {
  item: ItemDetails;
  categories: { id: string; name: string }[];
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export const EditItemForm = React.forwardRef<HTMLFormElement, EditItemFormProps>(
  ({ item, categories, onSuccess, onDirtyChange }, ref) => {
    const { toast } = useToast();
    const { update } = useItemMutations();

    const form = useForm<z.infer<typeof UPDATE_ITEM_SCHEMA>>({
      resolver: zodResolver(UPDATE_ITEM_SCHEMA),
      defaultValues: {
        name: item.item_name || "",
        sku: item.sku || "",
        listing_price: item.listing_price || 0,
        default_cogs: item.default_cogs || 0,
        inventory_group_id: item.inventory_group_id || "",
      },
    });

    useEffect(() => {
      form.reset({
        name: item.item_name || "",
        sku: item.sku || "",
        listing_price: item.listing_price || 0,
        default_cogs: item.default_cogs || 0,
        inventory_group_id: item.inventory_group_id || "",
      });
      onDirtyChange?.(false);
    }, [item, form, onDirtyChange]);

    useEffect(() => {
      const subscription = form.watch(() => {
        onDirtyChange?.(form.formState.isDirty);
      });
      return () => subscription.unsubscribe();
    }, [form, onDirtyChange]);

    const onSubmit = (data: z.infer<typeof UPDATE_ITEM_SCHEMA>) => {
      update.mutate(
        { itemId: { item_id: item.item_id! }, updates: data },
        {
          onSuccess: () => {
            toast({ title: "Success", description: "Item updated!" });
            form.reset(data);
            onDirtyChange?.(false);
            onSuccess?.();
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to update item",
              variant: "destructive"
            });
          }
        }
      );
    };

    return (
      <Form {...form}>
        <form
          ref={ref}
          onSubmit={form.handleSubmit(onSubmit)}
          className="h-full space-y-6 p-6"
          autoFocus={false}
        >
          <TextInput 
            control={form.control} 
            name="name" 
            label="Item Name" 
            placeholder="Enter item name"
          />

          <div className="grid grid-cols-2 gap-6">
            <NumberInput
              control={form.control}
              name="default_cogs"
              label="Default COGS"
              placeholder="Enter cost of goods sold"
              step={0.01}
              min={0}
            />
            <TextInput
              control={form.control}
              name="sku"
              label="SKU (optional)"
              placeholder="Enter SKU (e.g. ABC123, 112341)"
            />
          </div>

          <NumberInput
            control={form.control}
            name="listing_price"
            label="Listing Price"
            placeholder="Enter listing price"
          />

          <SelectInput
            control={form.control}
            name="inventory_group_id"
            label="Inventory Group"
            options={categories}
            placeholder="Select group"
          />

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Purchase History
            </Label>
            {item.purchase_batches?.length > 0 && (
              <div className="space-y-1">
                {item.purchase_batches.map((batch, index) => (
 
                <PurchaseBatchCard
                    key={`${batch.id}-${index}-${batch.created_at}`}
                    batch={batch}
                  />
                ))}
              </div>
            )}
          </div>
        </form>
      </Form>
    );
  }
);