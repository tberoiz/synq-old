"use client";

import {
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
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@synq/ui/use-toast";
import React, { useState } from "react";
import { cn } from "@synq/ui/utils";
import { Badge } from "@synq/ui/badge";
import { format } from "date-fns";
import { Sale } from "@synq/supabase/types";
import { Button } from "@synq/ui/button";
import { SaleItemsTable } from "./sale-items-table";
import { updateSale, getUserId } from "@synq/supabase/queries";

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
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    if (!sale) return;

    try {
      setIsUpdating(true);
      await updateSale(await getUserId(), sale.id, {
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
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto space-y-6 p-4">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                <div>
                  <div className="text-lg font-medium">Sale Details</div>
                  <SheetDescription className="text-sm text-muted-foreground">
                    Sale information and items
                  </SheetDescription>
                </div>
              </div>
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
            <SaleItemsTable items={sale.items} />
          </div>
        </div>

        <SheetFooter className="border-t bg-background p-4">
          <div className="w-full">
            <div className="flex items-center justify-center h-10">
              <p className="text-sm text-muted-foreground">
                Sale {sale.status === "completed" ? "completed" : "created"} on{" "}
                {format(new Date(sale.sale_date), "MMM dd, yyyy")}
              </p>
            </div>
          </div>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}
