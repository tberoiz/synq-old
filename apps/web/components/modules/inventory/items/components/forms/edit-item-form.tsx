"use client";

import { useEffect } from "react";
import { Control, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";

import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { SheetFooter } from "@synq/ui/sheet";
import { DollarSign, Truck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synq/ui/form";

import { updateItemDetails } from "@synq/supabase/queries";
import { createClient } from "@synq/supabase/client";
import { useToast } from "@synq/ui/use-toast";
import { Label } from "@synq/ui/label";
import { Badge } from "@synq/ui/badge";
import type {
  ItemDetails,
  TransformedPurchaseBatch,
} from "@synq/supabase/types";

const itemSchema = z.object({
  name: z.string().min(2),
  sku: z
    .string()
    .optional()
    .transform((val) => val || null),
  listing_price: z.number().min(0),
  default_cogs: z.number().min(0),
  inventory_group_id: z.string().min(1),
});

interface EditItemFormProps {
  item: ItemDetails;
  categories: { id: string; name: string }[];
  onSuccess?: () => void;
}

const PurchaseBatchCard = ({ batch }: { batch: TransformedPurchaseBatch }) => (
  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium truncate">Q1 2024 Audio Batch</h4>
        <Badge variant="outline" className="text-xs">
          <time dateTime={batch.created_at}>
            {format(new Date(batch.created_at), "MMM dd, yyyy")}
          </time>
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
        <span>${batch.unit_cost}</span>
        <span>•</span>
        <span>{batch.quantity} units</span>
        <span>•</span>
        <span>${(batch.unit_cost * batch.quantity).toFixed(2)} total</span>
      </div>
    </div>
  </div>
);

const NumberInput = ({
  control,
  name,
  label,
  disabled = false,
}: {
  control: Control<any>;
  name: string;
  label: string;
  disabled?: boolean;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input
            {...field}
            type="number"
            step="0.01"
            disabled={disabled}
            onChange={(e) => field.onChange(parseFloat(e.target.value))}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export function EditItemForm({
  item,
  categories,
  onSuccess,
}: EditItemFormProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      sku: "",
      listing_price: 0,
      default_cogs: 0,
      inventory_group_id: item.inventory_group_id,
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
  }, [item, form]);

  const { mutate: updateItemMutation, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof itemSchema>) => {
      if (!item.item_id) throw new Error("Item ID is required");
      return updateItemDetails(supabase, { item_id: item.item_id }, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_inv_items"] });
      queryClient.invalidateQueries({
        queryKey: ["item_details", { item_id: item.item_id }],
      });
      toast({ title: "Success", description: "Item updated!" });
      onSuccess?.();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => updateItemMutation(data))}
        className="flex flex-col h-full"
      >
        <div className="flex-1 overflow-y-auto space-y-6 p-6">
          {/* Item Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* COGS and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              control={form.control}
              name="default_cogs"
              label="Default COGS"
            />
            <div>
              <Label>Total Quantity</Label>
              <Input
                value={item.total_quantity || 0}
                disabled
                type="number"
              />
            </div>
          </div>

          {/* Listing Price */}
          <NumberInput
            control={form.control}
            name="listing_price"
            label="Listing Price"
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="inventory_group_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inventory Group</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Purchase History */}
          {item.purchase_batches && item.purchase_batches.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Purchase History</Label>
              <div className="space-y-1">
                {item.purchase_batches.map((batch) => (
                  <PurchaseBatchCard
                    key={`${batch.id}-${batch.created_at}`}
                    batch={batch}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="border-t bg-background p-4">
          <Button type="submit" disabled={isPending || !form.formState.isDirty} className="w-full">
            {isPending ? "Saving..." : form.formState.isDirty ? "Save Changes" : "No Changes"}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
