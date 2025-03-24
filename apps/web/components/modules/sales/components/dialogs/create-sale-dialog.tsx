"use client";

import * as React from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {type CreateSaleInput, createSaleSchema} from "@synq/supabase/types";
import {useToast} from "@synq/ui/use-toast";
import {Button} from "@synq/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@synq/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@synq/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@synq/ui/select";
import {Input} from "@synq/ui/input";
import {Textarea} from "@synq/ui/textarea";
import {
  PlusIcon,
  ShoppingCart,
  Calendar,
  DollarSign,
  Package,
  Tag,
  Truck,
  Receipt,
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import {format} from "date-fns";
import {SaleItemsTable} from "./sale-items-table";
import {createSale, getUserId} from "@synq/supabase/queries";

export function CreateSaleDialog() {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateSaleInput>({
    resolver: zodResolver(createSaleSchema),
    defaultValues: {
      platform: "ebay",
      status: "listed",
      shippingCost: 0,
      taxAmount: 0,
      platformFees: 0,
      items: [],
    },
  });

  const items = form.watch("items");
  const canSubmit = items.length > 0 && form.watch("platform") && form.watch("status");

  const { mutate: handleSubmit, isPending } = useMutation({
    mutationFn: async (data: CreateSaleInput) => {
      const userId = await getUserId();
      if (!userId) throw new Error("User ID not found");

      return await createSale(
        userId,
        {
          status: data.status,
          platform: data.platform,
          saleDate: data.saleDate || new Date(),
          shippingCost: data.shippingCost,
          taxAmount: data.taxAmount,
          platformFees: data.platformFees,
          notes: data.notes,
        },
        data.items.map((item) => ({
          purchaseItemId: item.purchaseItemId,
          quantity: item.quantity,
          salePrice: item.salePrice,
        })),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["sales"]}).then(() => {});
      toast({
        title: "Sale created",
        description: "Your sale has been created successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateTotals = React.useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const subtotal = (item.quantity || 0) * (item.salePrice || 0);
        return {
          subtotal: acc.subtotal + subtotal,
          totalItems: acc.totalItems + (item.quantity || 0),
        };
      },
      { subtotal: 0, totalItems: 0 },
    );
  }, [items]);

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          form.reset();
        }
        setOpen(newOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <PlusIcon className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Create New Sale
          </DialogTitle>
          <DialogDescription>
            Add a new sale to your inventory.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => handleSubmit(data))}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Platform
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ebay">eBay</SelectItem>
                          <SelectItem value="amazon">Amazon</SelectItem>
                          <SelectItem value="etsy">Etsy</SelectItem>
                          <SelectItem value="shopify">Shopify</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs flex items-center gap-1">
                        {field.value === "completed" ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : field.value === "cancelled" ? (
                          <XCircle className="h-3 w-3 text-red-500" />
                        ) : (
                          <Clock className="h-3 w-3 text-blue-500" />
                        )}
                        Status
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="listed">Listed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="saleDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Sale Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Shipping Cost
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="h-8 text-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        Tax Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="h-8 text-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="platformFees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        Platform Fees
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="h-8 text-sm"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Sale Items
                    </h3>
                    {items.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Selected {items.length} unique items ({calculateTotals.totalItems} total)
                      </div>
                    )}
                  </div>
                  <SaleItemsTable />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Notes
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any notes about this sale..."
                            className="h-[calc(100%-2rem)] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {items.length > 0 && (
                    <div className="rounded-lg border p-3 space-y-1.5 text-sm bg-muted/5">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Subtotal
                        </span>
                        <span>${calculateTotals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          Shipping Cost
                        </span>
                        <span>${form.watch("shippingCost").toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          <Receipt className="h-3 w-3" />
                          Tax Amount
                        </span>
                        <span>${form.watch("taxAmount").toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          Platform Fees
                        </span>
                        <span>${form.watch("platformFees").toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-1.5 mt-1.5 font-medium flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Total
                        </span>
                        <span>
                          $
                          {(
                            calculateTotals.subtotal +
                            (form.watch("shippingCost") || 0) +
                            (form.watch("taxAmount") || 0) +
                            (form.watch("platformFees") || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit || isPending}>
                {isPending ? "Creating..." : "Create Sale"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
