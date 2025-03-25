"use client";

import {
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
import { useToast } from "@synq/ui/use-toast";
import React, { useState } from "react";
import { cn } from "@synq/ui/utils";
import { Badge } from "@synq/ui/badge";
import { format } from "date-fns";
import { Button } from "@synq/ui/button";
import { SaleItemsTable } from "./sale-items-table";
import { useSaleDetailsQuery, useSaleMutations } from "../../queries/sales";
import { useIsMobile } from "@synq/ui/use-mobile";
import { EditSaleForm } from "../forms/edit-sale-form";
import { type UpdateSaleFormData } from "../forms/edit-sale-form";

interface SaleDetailsSheetProps {
  saleId: string | null;
  onOpenChange?: (open: boolean) => void;
}

export default function SaleDetailsSheet({
  saleId,
  onOpenChange,
}: SaleDetailsSheetProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { data: sale, isLoading } = useSaleDetailsQuery(saleId);
  const { update } = useSaleMutations();
  const [isFormDirty, setIsFormDirty] = useState(false);

  const handleSubmit = async (data: UpdateSaleFormData) => {
    if (!sale) return;

    try {
      await update.mutate({
        saleId: sale.id,
        updates: {
          status: data.status,
          platform: data.platform,
          saleDate: data.sale_date,
          shippingCost: data.shipping_cost,
          taxAmount: data.tax_amount,
          platformFees: data.platform_fees,
          notes: data.notes,
        },
      });
      toast({
        title: "Success",
        description: "Sale updated successfully",
      });
      setIsFormDirty(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update sale",
      });
    }
  };

  if (!saleId || isLoading) return null;
  if (!sale) return null;

  return (
    <SheetContent
      side={isMobile ? "bottom" : "right"}
      className={cn(
        "w-full sm:max-w-xl flex flex-col",
        isMobile && "h-3/4 w-full",
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
            </SheetTitle>
          </SheetHeader>

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

          <EditSaleForm
            sale={sale}
            onSubmit={handleSubmit}
            onFormStateChange={setIsFormDirty}
          />
        </div>

        <SheetFooter className="border-t bg-background p-4">
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center h-10">
              <p className="text-sm text-muted-foreground">
                Sale {sale.status === "completed" ? "completed" : "created"} on{" "}
                {format(new Date(sale.sale_date), "MMM dd, yyyy")}
              </p>
            </div>
            {isFormDirty && (
              <Button
                type="submit"
                form="edit-sale-form"
                disabled={update.isPending}
                className="w-full"
              >
                {update.isPending ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}
