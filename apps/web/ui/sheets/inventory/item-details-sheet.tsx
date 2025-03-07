"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect } from "react";
import React from "react";

import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetContent,
} from "@synq/ui/sheet";
import { Tag, DollarSign, Truck, Warehouse } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@synq/ui/card";

import {
  updateItemDetails,
  type ItemViewWithPurchaseBatches,
  type Purchase,
} from "@synq/supabase/queries";
import { createClient } from "@synq/supabase/client";
import { useToast } from "@synq/ui/use-toast";
import { Label } from "@synq/ui/label";
import { Badge } from "@synq/ui/badge";
import PurchaseDetailsSheet from "./purchase-details-sheet";

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

type PurchaseBatch = {
  id: string;
  name: string;
  quantity: number;
  unit_cost: number;
  created_at: string;
};

interface ItemDetailsSheetProps {
  item: ItemViewWithPurchaseBatches | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ItemDetailsSheet({
  item,
  open,
  onOpenChange,
}: ItemDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-1/4">
        <ItemDetailsSheetContent item={item} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}

function ItemDetailsSheetContent({
  item,
  onOpenChange,
}: {
  item: ItemViewWithPurchaseBatches | null;
  onOpenChange?: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { toast } = useToast();
  const [selectedPurchase, setSelectedPurchase] =
    React.useState<Purchase | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["inventory_groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_inventory_groups")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { mutate: updateItemMutation, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof itemSchema>) => {
      if (!item?.item_id) throw new Error("Item ID is required");
      return updateItemDetails(supabase, item.item_id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_inv_items"] });
      toast({ title: "Success", description: "Item updated!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  const handleRestore = async () => {
    try {
      await updateItemDetails(supabase, item!.item_id!, {
        name: item!.item_name!,
        sku: item!.sku,
        listing_price: item!.listing_price!,
        default_cogs: item!.default_cogs!,
        inventory_group_id: item!.inventory_group_id!,
        is_archived: false,
      });
      await queryClient.invalidateQueries({ queryKey: ["user_inv_items"] });
      toast({ title: "Success", description: "Item restored!" });
      onOpenChange?.(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: item
      ? {
          name: item.item_name || "",
          sku: item.sku || "",
          listing_price: item.listing_price || 0,
          default_cogs: item.default_cogs || 0,
          inventory_group_id:
            categories?.find((cat) => cat.name === item.category)?.id || "",
        }
      : undefined,
  });

  const inventoryGroupId = watch("inventory_group_id");

  useEffect(() => {
    if (categories && item?.category) {
      const categoryId = categories.find(
        (cat) => cat.name === item.category,
      )?.id;
      if (categoryId && categoryId !== inventoryGroupId) {
        setValue("inventory_group_id", categoryId);
      }
    }
  }, [categories, item?.category, setValue, inventoryGroupId]);

  if (!item)
    return (
      <div className="p-4 text-center">Select an item to view details</div>
    );

  return (
    <div className="flex flex-col h-full">
      {item.is_archived && (
        <div className="bg-muted/50 border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                This item is archived
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleRestore}>
              Restore Item
            </Button>
          </div>
        </div>
      )}
      <form
        onSubmit={handleSubmit((data) => updateItemMutation(data))}
        className="flex flex-col h-full"
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Tag className="h-6 w-6" />
              <div>
                <div className="text-lg font-medium truncate max-w-[300px]">
                  {item.item_name}
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <Label>Item Name</Label>
              <Input {...register("name")} className="truncate" />
              {errors.name && <FormError error={errors.name} />}
            </div>

            <div>
              <Label>SKU (optional)</Label>
              <Input {...register("sku")} className="truncate" />
              {errors.sku && <FormError error={errors.sku} />}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Listing Price</Label>
                <Input
                  {...register("listing_price", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                />
                {errors.listing_price && (
                  <FormError error={errors.listing_price} />
                )}
              </div>

              <div>
                <Label>Default COGS</Label>
                <Input
                  {...register("default_cogs", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                />
                {errors.default_cogs && (
                  <FormError error={errors.default_cogs} />
                )}
              </div>
            </div>

            <div>
              <Label>Category</Label>
              <Select
                onValueChange={(value) => setValue("inventory_group_id", value)}
                value={inventoryGroupId}
              >
                <SelectTrigger className="truncate">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
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
              {errors.inventory_group_id && (
                <FormError error={errors.inventory_group_id} />
              )}
            </div>

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

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Truck />
                <h3 className="text-lg font-semibold">Purchase History</h3>
              </div>
              <div className="grid gap-4 overflow-y-auto max-h-60">
                {item.purchase_batches?.map((batch) => (
                  <Card key={batch.id}>
                    <CardHeader className="flex flex-row items-center justify-between px-4 py-3 space-y-0">
                      <CardTitle className="text-base font-semibold truncate max-w-[70%]">
                        {batch.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="px-4 pt-0 pb-3">
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          <div>
                            <p className="">${batch.unit_cost}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Warehouse className="h-5 w-5 text-gray-500" />
                          <div>
                            <p>{batch.quantity}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="px-2 py-1 text-xs text-center bg-blue-100 text-blue-600"
                        >
                          <time
                            dateTime={batch.created_at}
                            title={batch.created_at}
                          >
                            {format(new Date(batch.created_at), "MMM dd, yyyy")}
                          </time>
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t bg-background p-4">
          <div className="w-full">
            {isDirty ? (
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
    </div>
  );
}

const FormError = ({ error }: { error: { message?: string } }) => (
  <p className="text-red-500 text-xs mt-1">{error.message || ""}</p>
);
