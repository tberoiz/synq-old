"use client";

import {
  Package,
  DollarSign,
  Box,
  TrendingUp,
  ShoppingCart,
  CheckCircle2Icon,
  ClockIcon,
} from "lucide-react";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetContent,
} from "@synq/ui/sheet";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { createClient } from "@synq/supabase/client";
import { useToast } from "@synq/ui/use-toast";
import { getUserId } from "@synq/supabase/queries";
import { Button } from "@synq/ui/button";
import React, { useState } from "react";
import { cn } from "@synq/ui/utils";
import { Badge } from "@synq/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import { updateSale } from "../../../app/actions/sales";

interface SaleItem {
  id: string;
  item_id: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_cost: number;
  total_cost: number;
  profit: number;
}

interface Sale {
  id: string;
  user_id: string;
  status: "listed" | "completed" | "cancelled";
  platform: string;
  sale_date: string;
  shipping_cost: number;
  tax_amount: number;
  platform_fees: number;
  notes: string | null;
  total_items: number;
  total_quantity: number;
  total_cogs: number;
  total_revenue: number;
  net_profit: number;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
}

interface SaleDetailsSheetProps {
  sale: Sale | null;
  isMobile?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SaleDetailsSheet({
  sale,
  isMobile,
  onOpenChange,
}: SaleDetailsSheetProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    if (!sale) return;

    try {
      setIsUpdating(true);
      await updateSale({
        id: sale.id,
        status: "completed",
      });

      await queryClient.invalidateQueries({ queryKey: ["sales"] });
      await queryClient.invalidateQueries({ queryKey: ["user_inv_items"] });

      toast({
        title: "Success",
        description: "Sale marked as completed",
      });

      if (onOpenChange) onOpenChange(false);
    } catch (error) {
      console.error("Error updating sale status:", error);
      toast({
        title: "Error",
        description: "Failed to update sale status",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Early return if no sale
  if (!sale) return null;

  return (
    <SheetContent
      side={isMobile ? "bottom" : "right"}
      className={cn(
        "w-full sm:max-w-xl flex flex-col",
        isMobile && "h-[90vh] mt-auto",
      )}
    >
      <div className="flex-1 overflow-y-auto">
        <SheetHeader className="px-1">
          <div className="flex items-center justify-between">
            <SheetTitle>Sale Details</SheetTitle>
            {sale.status === "listed" && (
              <Button
                variant="outline"
                size="sm"
                className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-300 dark:hover:bg-green-900/20"
                onClick={handleStatusUpdate}
                disabled={isUpdating}
              >
                <CheckCircle2Icon className="mr-2 h-4 w-4" />
                {isUpdating ? "Updating..." : "Mark as Completed"}
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto space-y-6 p-4">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                <div>
                  <div className="text-lg font-medium">Sale Details</div>
                  <SheetDescription className="text-sm text-muted-foreground">
                    Sale information and items
                  </SheetDescription>
                </div>
              </SheetTitle>
            </SheetHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
              <div className="p-4 border rounded-lg bg-orange-50">
                <div className="flex items-center gap-2">
                  <Box className="h-5 w-5 text-orange-600" />
                  <p className="text-sm text-orange-600">Total Items</p>
                </div>
                <p className="text-lg font-semibold text-orange-900">
                  {sale.total_items}
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-indigo-50">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-indigo-600" />
                  <p className="text-sm text-indigo-600">Total Revenue</p>
                </div>
                <p className="text-lg font-semibold text-indigo-900">
                  ${sale.total_revenue.toFixed(2)}
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-emerald-50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <p className="text-sm text-emerald-600">Total Profit</p>
                </div>
                <p className="text-lg font-semibold text-emerald-900">
                  ${sale.net_profit.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Sale Items</h3>
                  <Badge
                    variant="secondary"
                    className={cn(
                      sale.status === "listed" &&
                        "bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-950/20 dark:text-blue-300",
                      sale.status === "completed" &&
                        "bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-950/20 dark:text-green-300",
                      sale.status === "cancelled" &&
                        "bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-950/20 dark:text-red-300",
                    )}
                  >
                    {sale.status === "listed" ? (
                      <ClockIcon className="mr-1 h-3 w-3" />
                    ) : sale.status === "completed" ? (
                      <CheckCircle2Icon className="mr-1 h-3 w-3" />
                    ) : (
                      <ClockIcon className="mr-1 h-3 w-3" />
                    )}
                    {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total Price</TableHead>
                      <TableHead className="text-right">COGS</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.unit_price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.total_price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.total_cost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-green-500">
                          ${item.profit.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <SheetFooter className="border-t bg-background p-4">
            <div className="w-full">
              <div className="flex items-center justify-center h-10">
                <p className="text-sm text-muted-foreground">
                  Sale {sale.status === "completed" ? "completed" : "created"}{" "}
                  on {format(new Date(sale.sale_date), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
          </SheetFooter>
        </div>
      </div>
    </SheetContent>
  );
}
