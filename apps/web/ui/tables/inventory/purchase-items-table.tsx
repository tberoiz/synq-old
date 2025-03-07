"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import { Skeleton } from "@synq/ui/skeleton";
import { Input } from "@synq/ui/input";
import { ChevronDown, SquarePen, Trash } from "lucide-react";
import { Button } from "@synq/ui/button";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import ItemDetailsSheet from "@ui/sheets/inventory/item-details-sheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@synq/supabase/client";
import { fetchItemDetails } from "@synq/supabase/queries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@synq/ui/dropdown-menu";
import { cn } from "@synq/ui/utils";

type PurchaseItem = {
  id: string;
  quantity: number;
  unit_cost: number;
  remaining_quantity: number;
  item: {
    id: string;
    name: string;
    sku: string;
    is_archived: boolean;
  };
};

type PurchaseBatch = {
  id: string;
  name: string;
  quantity: number;
  unit_cost: number;
  created_at: string;
};

type ItemDetailsSheetItem = {
  item_id: string | null;
  item_name: string | null;
  sku: string | null;
  category: string | null;
  listing_price: number | null;
  default_cogs: number | null;
  total_quantity: number | null;
  total_sold: number | null;
  user_id: string | null;
  inventory_group_id: string | null;
  is_archived: boolean | null;
  purchase_batches: PurchaseBatch[];
};

export interface PurchaseItemsTableRef {
  saveChanges: () => Promise<void>;
}

const PurchaseItemsTable = forwardRef<
  PurchaseItemsTableRef,
  {
    data?: PurchaseItem[];
    loading?: boolean;
    onRemoveItem?: (purchaseItemId: string) => void;
    onSaveBatch?: (
      updates: { id: string; quantity: number; unit_cost: number }[],
    ) => Promise<void>;
    showHeader?: boolean;
    onDirtyChange?: (isDirty: boolean) => void;
  }
>(
  (
    {
      data = [],
      loading,
      onRemoveItem,
      onSaveBatch,
      showHeader = true,
      onDirtyChange,
    },
    ref,
  ) => {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const { data: selectedItem, isLoading: isItemLoading } =
      useQuery<ItemDetailsSheetItem | null>({
        queryKey: ["item_details", selectedItemId],
        queryFn: async () => {
          if (!selectedItemId) return null;
          console.log("Fetching item details for:", selectedItemId);
          const item = await fetchItemDetails(supabase, selectedItemId);
          console.log("Fetched item:", item);
          return item as ItemDetailsSheetItem;
        },
        enabled: !!selectedItemId,
        select: (data) => data || null,
      });

    const [updates, setUpdates] = useState<{
      [purchaseItemId: string]: { quantity: number; unit_cost: number };
    }>({});

    useEffect(() => {
      const hasChanges = Object.keys(updates).length > 0;
      onDirtyChange?.(hasChanges);
    }, [updates, onDirtyChange]);

    const handleUpdate = (
      purchaseItemId: string,
      field: "quantity" | "unit_cost",
      value: string,
    ) => {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) return;

      const currentItem = data.find((item) => item.id === purchaseItemId);
      if (!currentItem) return;

      const currentUpdates = updates[purchaseItemId] || {
        quantity: currentItem.quantity,
        unit_cost: currentItem.unit_cost,
      };

      setUpdates((prev) => ({
        ...prev,
        [purchaseItemId]: {
          ...currentUpdates,
          [field]: parsedValue,
        },
      }));
    };

    const handleSaveChanges = async () => {
      if (!onSaveBatch) return;

      const updatesToSave = Object.entries(updates).map(([id, values]) => ({
        id,
        quantity: values.quantity || 0,
        unit_cost: values.unit_cost || 0,
      }));

      if (updatesToSave.length > 0) {
        await onSaveBatch(updatesToSave);
        setUpdates({});
      }
    };

    useImperativeHandle(ref, () => ({
      saveChanges: handleSaveChanges,
    }));

    const hasChanges = Object.keys(updates).length > 0;

    const handleOpenSheet = (itemId: string) => {
      setSelectedItemId(itemId);
      setIsSheetOpen(true);
    };

    const handleRemoveItem = async (purchaseItemId: string) => {
      await onRemoveItem?.(purchaseItemId);
      setOpenDropdownId(null);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user_purchases"] }),
        queryClient.invalidateQueries({ queryKey: ["purchase_details"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
      ]);
    };

    if (loading) {
      return (
        <div className="border overflow-x-auto lg:max-h-[800px] overflow-y-auto">
          <Table>
            {showHeader && (
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ) : (data || []).length > 0 ? (
                (data || []).map((purchaseItem) => {
                  const updatedQuantity =
                    updates[purchaseItem.id]?.quantity ?? purchaseItem.quantity;
                  const updatedUnitCost =
                    updates[purchaseItem.id]?.unit_cost ??
                    purchaseItem.unit_cost;

                  return (
                    <TableRow
                      key={purchaseItem.id}
                      className={cn(
                        "bg-secondary/80",
                        purchaseItem.item.is_archived && "opacity-50",
                      )}
                    >
                      <TableCell className="max-w-[200px] truncate">
                        <div className="flex items-center gap-2">
                          {purchaseItem.item.name}
                          {purchaseItem.item.is_archived && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              Archived
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={updatedQuantity}
                          onChange={(e) =>
                            handleUpdate(
                              purchaseItem.id,
                              "quantity",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={updatedUnitCost}
                          onChange={(e) =>
                            handleUpdate(
                              purchaseItem.id,
                              "unit_cost",
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu
                          open={openDropdownId === purchaseItem.id}
                          onOpenChange={(open) =>
                            setOpenDropdownId(open ? purchaseItem.id : null)
                          }
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSheet(purchaseItem.item.id);
                              }}
                            >
                              <SquarePen className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveItem(purchaseItem.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {isItemLoading ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-4 w-full" />
          </div>
        ) : selectedItem ? (
          <ItemDetailsSheet
            item={selectedItem}
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
          />
        ) : null}
      </div>
    );
  },
);

export default PurchaseItemsTable;
