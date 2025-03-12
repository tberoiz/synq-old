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
import { DollarSign, Truck, Warehouse } from "lucide-react";
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
  <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
    <div className="flex-shrink-0">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <DollarSign className="h-5 w-5 text-primary" />
      </div>
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h4 className="font-medium truncate">{batch.name}</h4>
        <Badge
          variant="outline"
          className="shrink-0 bg-primary/5 text-primary border-primary/20"
        >
          <time dateTime={batch.created_at} title={batch.created_at}>
            {format(new Date(batch.created_at), "MMM dd, yyyy")}
          </time>
        </Badge>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">
            ${batch.unit_cost}
          </span>
          <span>per unit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Warehouse className="h-4 w-4" />
          <span>
            <span className="font-medium text-foreground">
              {batch.quantity}
            </span>{" "}
            units
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">
            ${(batch.unit_cost * batch.quantity).toFixed(2)}
          </span>
          <span>total</span>
        </div>
      </div>
    </div>
  </div>
);

const NumberInput = ({
  control,
  name,
  label,
}: {
  control: Control<any>;
  name: string;
  label: string;
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
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Essential Item Information */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="truncate" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} className="truncate" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inventory_group_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="truncate">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          className="truncate"
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
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Financial Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                control={form.control}
                name="listing_price"
                label="Listing Price"
              />
              <NumberInput
                control={form.control}
                name="default_cogs"
                label="Default COGS"
              />
            </div>
          </div>

          {/* Inventory Statistics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Current Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Stock</Label>
                <Input
                  value={item.total_quantity || 0}
                  disabled
                  type="number"
                />
              </div>
              <div>
                <Label>Total Sold</Label>
                <Input value={item.total_sold || 0} disabled type="number" />
              </div>
            </div>
          </div>

          {/* Purchase History */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Purchase History</h3>
            </div>
            <div className="grid gap-4 overflow-y-auto max-h-60">
              {item.purchase_batches?.map((batch) => (
                <PurchaseBatchCard
                  key={`${batch.id}-${batch.created_at}`}
                  batch={batch}
                />
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="border-t bg-background">
          <div className="w-full">
            {form.formState.isDirty ? (
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
              <div className="flex items-center justify-center h-10">
                <p className="text-sm text-muted-foreground">
                  No changes to save
                </p>
              </div>
            )}
          </div>
        </SheetFooter>
      </form>
    </Form>
  );
}
