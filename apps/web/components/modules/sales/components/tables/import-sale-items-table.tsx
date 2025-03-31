"use client";

// REACT
import * as React from "react";

// API
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@synq/supabase/client";
import { getUserId } from "@synq/supabase/queries";
import { type SaleItemWithDetails } from "@synq/supabase/types";

// UI COMPONENTS
import { Input } from "@synq/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
} from "lucide-react";

// UTILS
import { format } from "date-fns";

interface PurchaseItem {
  id: string;
  item: {
    id: string;
    name: string;
    sku?: string;
  };
  remaining_quantity: number;
  unit_cost: number;
  batch: {
    id: string;
    name: string;
    created_at: string;
  };
}

interface BatchGroup {
  batchId: string;
  batchName: string;
  purchaseDate: string;
  items: PurchaseItem[];
}

interface ImportSaleItemsTableProps {
  onSelectionChange: (items: SaleItemWithDetails[]) => void;
}

export function ImportSaleItemsTable({ onSelectionChange }: ImportSaleItemsTableProps) {
  const [expandedBatches, setExpandedBatches] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());

  // Fetch available purchase items
  const { data: purchaseItems, isLoading } = useQuery({
    queryKey: ["purchase-items"],
    queryFn: async () => {
      try {
        const supabase = createClient();
        const userId = await getUserId();

        const { data, error } = await supabase
          .from("user_purchase_items")
          .select(
            `
            id,
            remaining_quantity,
            unit_cost,
            batch:user_purchase_batches!inner (
              id,
              name,
              created_at
            ),
            item:user_inventory_items!inner (
              id,
              name,
              sku
            )
            `,
          )
          .eq("user_id", userId)
          .gt("remaining_quantity", 0)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as unknown as PurchaseItem[];
      } catch (err) {
        console.error("Error fetching purchase items:", err);
        throw err;
      }
    },
  });

  const groupedByBatch = React.useMemo(() => {
    if (!purchaseItems) return [];

    const groups = purchaseItems.reduce(
      (acc, item) => {
        const key = item.batch.id;
        if (!acc[key]) {
          acc[key] = {
            batchId: item.batch.id,
            batchName: item.batch.name,
            purchaseDate: item.batch.created_at,
            items: [],
          };
        }
        acc[key].items.push(item);
        return acc;
      },
      {} as Record<string, BatchGroup>,
    );

    return Object.values(groups);
  }, [purchaseItems]);

  const filteredGroups = React.useMemo(() => {
    if (!searchQuery) return groupedByBatch;

    const query = searchQuery.toLowerCase();
    return groupedByBatch.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.item.name.toLowerCase().includes(query) ||
        (item.item.sku?.toLowerCase() || "").includes(query)
      )
    })).filter(group => group.items.length > 0);
  }, [groupedByBatch, searchQuery]);

  const toggleBatch = (batchId: string) => {
    setExpandedBatches((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) {
        next.delete(batchId);
      } else {
        next.add(batchId);
      }
      return next;
    });
  };

  const handleItemSelect = (purchaseItemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(purchaseItemId)) {
        next.delete(purchaseItemId);
      } else {
        next.add(purchaseItemId);
      }
      return next;
    });
  };

  // Update parent component when selections change
  React.useEffect(() => {
    const selectedSaleItems: SaleItemWithDetails[] = Array.from(selectedItems)
      .map((purchaseItemId) => {
        const purchaseItem = purchaseItems?.find(item => item.id === purchaseItemId);
        if (!purchaseItem) return null;
        
        return {
          purchase_item_id: purchaseItemId,
          sold_quantity: 1,
          sale_price: purchaseItem.unit_cost,
        };
      })
      .filter((item): item is SaleItemWithDetails => item !== null);

    onSelectionChange(selectedSaleItems);
  }, [selectedItems, purchaseItems, onSelectionChange]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8"
        />
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Available</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Loading items...
                </TableCell>
              </TableRow>
            ) : filteredGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  {searchQuery ? "No items found" : "No items available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredGroups.map((batch) => (
                <React.Fragment key={batch.batchId}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleBatch(batch.batchId)}
                  >
                    <TableCell>
                      {expandedBatches.has(batch.batchId) ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell colSpan={2} className="font-medium">
                      {batch.batchName}
                      <div className="text-xs text-muted-foreground">
                        Purchased on {format(new Date(batch.purchaseDate), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedBatches.has(batch.batchId) &&
                    batch.items.map((item) => (
                      <TableRow key={item.id} className="bg-muted/30">
                        <TableCell>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={selectedItems.has(item.id)}
                            onChange={() => handleItemSelect(item.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">{item.item.name}</div>
                            {item.item.sku && (
                              <div className="text-xs text-muted-foreground">
                                SKU: {item.item.sku}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.remaining_quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 