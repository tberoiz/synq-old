"use client";

import * as React from "react";
import { Input } from "@synq/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import { Button } from "@synq/ui/button";
import { Trash2 } from "lucide-react";
import { Badge } from "@synq/ui/badge";

interface PurchaseItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit_cost: number;
  is_archived: boolean;
}

export interface PurchaseItemsTableRef {
  getUpdates: () => { id: string; quantity: number; unit_cost: number }[];
}

interface PurchaseItemsTableProps {
  data: PurchaseItem[] | null;
  onRemoveItem: (id: string) => void;
  onSaveBatch: (updates: { id: string; quantity: number; unit_cost: number }[]) => void;
  onDirtyChange: (isDirty: boolean) => void;
  showHeader?: boolean;
}

const PurchaseItemsTable = React.forwardRef<PurchaseItemsTableRef, PurchaseItemsTableProps>(
  ({ data, onRemoveItem, onSaveBatch, onDirtyChange, showHeader = true }, ref) => {
    const [updates, setUpdates] = React.useState<Map<string, { quantity: number; unit_cost: number }>>(
      new Map()
    );

    React.useImperativeHandle(ref, () => ({
      getUpdates: () =>
        Array.from(updates.entries()).map(([id, { quantity, unit_cost }]) => ({
          id,
          quantity,
          unit_cost,
        })),
    }));

    const handleQuantityChange = (id: string, value: number) => {
      const currentUpdate = updates.get(id) || {
        quantity: data?.find((item) => item.id === id)?.quantity || 0,
        unit_cost: data?.find((item) => item.id === id)?.unit_cost || 0,
      };
      const newUpdates = new Map(updates);
      newUpdates.set(id, { ...currentUpdate, quantity: value });
      setUpdates(newUpdates);
      onDirtyChange(newUpdates.size > 0);
    };

    const handleUnitCostChange = (id: string, value: number) => {
      const currentUpdate = updates.get(id) || {
        quantity: data?.find((item) => item.id === id)?.quantity || 0,
        unit_cost: data?.find((item) => item.id === id)?.unit_cost || 0,
      };
      const newUpdates = new Map(updates);
      newUpdates.set(id, { ...currentUpdate, unit_cost: value });
      setUpdates(newUpdates);
      onDirtyChange(newUpdates.size > 0);
    };

    return (
      <div className="relative">
        <Table>
          {showHeader && (
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Item</TableHead>
                <TableHead className="w-[20%]">Quantity</TableHead>
                <TableHead className="w-[20%]">Unit Cost</TableHead>
                <TableHead className="w-[20%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {data?.map((item) => {
              const update = updates.get(item.id);
              const quantity = update?.quantity ?? item.quantity;
              const unitCost = update?.unit_cost ?? item.unit_cost;

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        {item.name}
                        {item.is_archived && (
                          <Badge variant="outline" className="text-xs">
                            archived
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        SKU: {item.sku}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      className="h-8"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-8"
                      value={unitCost}
                      onChange={(e) => handleUnitCostChange(item.id, parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {(!data || data.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
);

PurchaseItemsTable.displayName = "PurchaseItemsTable";

export default PurchaseItemsTable; 
