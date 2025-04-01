"use client";

// CORE

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { createClient } from "@synq/supabase/client";
import { useToast } from "@synq/ui/use-toast";
import { fetchItemsView, getUserId } from "@synq/supabase/queries";
import { createPurchase } from "@synq/supabase/queries";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { Label } from "@synq/ui/label";
import { ImportItem } from "@synq/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import { Trash2 } from "lucide-react";
import { ImportItemsDialog } from "../dialogs/import-items-dialog";

const purchaseSchema = z.object({
  name: z.string().min(2),
  items: z
    .array(
      z.object({
        item_id: z.string(),
        quantity: z.number().min(1),
        unit_cost: z.number().min(0),
      })
    )
    .min(1),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

type PurchaseItem = {
  item_id: string;
  quantity: number;
  unit_cost: number;
};

interface CreatePurchaseFormProps {
  onSuccess?: (purchase: any) => void;
}

export default function CreatePurchaseForm({
  onSuccess,
}: CreatePurchaseFormProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { toast } = useToast();

  // Fetch user ID
  // Fetch available items
  const { data: inventoryItems, isLoading: isItemsLoading } = useQuery({
    queryKey: ["inventory_items"],
    queryFn: async () => {
      const userId = await getUserId();
      return fetchItemsView(supabase, {
        userId,
        page: 1,
        includeArchived: false,
      });
    },
  });

  // Create purchase mutation
  const { mutate: createPurchaseMutation, isPending } = useMutation({
    mutationFn: async (data: PurchaseFormData) => {
      const userId = await getUserId();
      return createPurchase(supabase, {
        name: data.name,
        userId,
        items: data.items,
      });
    },
    onSuccess: (purchase) => {
      queryClient.invalidateQueries({ queryKey: ["user_purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase_details"] });
      toast({ title: "Success", description: "Purchase created!" });
      onSuccess?.(purchase);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      name: "",
      items: [],
    },
  });

  const formItems = watch("items") || [];

  const handleImportItems = async (selectedItems: ImportItem[]) => {
    // Transform selected items into the format expected by the form
    const newItems: PurchaseItem[] = selectedItems.map((item) => ({
      item_id: item.item_id,
      quantity: 1,
      unit_cost: 0,
    }));

    // Append new items to existing ones
    setValue("items", [...formItems, ...newItems]);
  };

  // Helper function to get item details
  const getItemDetails = (itemId: string) => {
    return inventoryItems?.data?.find((item: { id: string; name: string }) => item.id === itemId);
  };

  return (
    <form
      onSubmit={handleSubmit((data) => createPurchaseMutation(data))}
      className="space-y-4"
    >
      <div>
        <Label>Purchase Name</Label>
        <Input {...register("name")} />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Select Items</Label>
          <ImportItemsDialog
            title="Select Items for Purchase"
            onImport={handleImportItems}
          />
        </div>

        {formItems.length > 0 && (
          <div className="space-y-4">
            <Label>Selected Items</Label>
            <div className="border rounded-md">
              <div className="relative">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Item</TableHead>
                      <TableHead className="w-[20%]">Quantity</TableHead>
                      <TableHead className="w-[20%]">Unit Cost</TableHead>
                      <TableHead className="w-[20%] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableBody>
                      {formItems.map((item, index) => {
                        const itemDetails = getItemDetails(item.item_id);
                        return (
                          <TableRow key={item.item_id}>
                            <TableCell className="font-medium">
                              {itemDetails?.name || "Unknown Item"}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                className="h-8"
                                {...register(
                                  `items.${index}.quantity` as const,
                                  {
                                    valueAsNumber: true,
                                  }
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                className="h-8"
                                {...register(
                                  `items.${index}.unit_cost` as const,
                                  {
                                    valueAsNumber: true,
                                  }
                                )}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newItems = formItems.filter(
                                    (_, i) => i !== index
                                  );
                                  setValue("items", newItems);
                                }}
                                disabled={formItems.length === 1}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending || formItems.length === 0}
        className="w-full"
      >
        {isPending ? "Creating..." : "Create Purchase"}
      </Button>
    </form>
  );
}
