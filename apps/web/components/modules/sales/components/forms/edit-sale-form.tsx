"use client";

// React and core dependencies
import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

// Types and hooks
import { type SaleDetails } from "@synq/supabase/types";

// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synq/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";
import { Input } from "@synq/ui/input";
import { Textarea } from "@synq/ui/textarea";

// Icons
import {
  Calendar,
  DollarSign,
  Tag,
  Truck,
  Receipt,
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

const UPDATE_SALE_SCHEMA = z.object({
  status: z.enum(["listed", "completed", "cancelled"]),
  platform: z.enum(["ebay", "amazon", "etsy", "shopify", "other"]),
  sale_date: z.date(),
  shipping_cost: z.number().min(0),
  tax_rate: z.number().min(0),
  tax_type: z.enum(["percentage", "fixed"]),
  tax_amount: z.number().min(0),
  platform_fees: z.number().min(0),
  notes: z.string().optional(),
});

export type UpdateSaleFormData = z.infer<typeof UPDATE_SALE_SCHEMA>;

interface EditSaleFormProps {
  sale: SaleDetails;
  onSubmit: (data: UpdateSaleFormData) => Promise<void>;
  onFormStateChange?: (isDirty: boolean) => void;
}

export function EditSaleForm({
  sale,
  onSubmit,
  onFormStateChange,
}: EditSaleFormProps) {
  const form = useForm<UpdateSaleFormData>({
    resolver: zodResolver(UPDATE_SALE_SCHEMA),
    defaultValues: {
      status: sale.status,
      platform: sale.platform as any,
      sale_date: new Date(sale.sale_date),
      shipping_cost: sale.shipping_cost || 0,
      tax_rate: sale.tax_rate || 0,
      tax_type: sale.tax_type || "percentage",
      tax_amount: sale.tax_amount || 0,
      platform_fees: sale.platform_fees || 0,
      notes: sale.notes || "",
    },
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      onFormStateChange?.(true);
    });
    return () => subscription.unsubscribe();
  }, [form, onFormStateChange]);

  return (
    <Form {...form}>
      <form
        id="edit-sale-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        <div className="flex-1 overflow-y-auto space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          onValueChange={(value) => {
                            field.onChange(value);
                            onFormStateChange?.(true);
                          }}
                          value={field.value}
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
                          onValueChange={(value) => {
                            field.onChange(value);
                            onFormStateChange?.(true);
                          }}
                          value={field.value}
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
                    name="sale_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Sale Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={
                              field.value
                                ? format(field.value, "yyyy-MM-dd")
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                            className="h-8 text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shipping_cost"
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
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Tax Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tax_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs flex items-center gap-1">
                          <Receipt className="h-3 w-3" />
                          Tax Rate
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="h-8 text-sm"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tax_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs flex items-center gap-1">
                          <Receipt className="h-3 w-3" />
                          Tax Type
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            onFormStateChange?.(true);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">
                              Percentage
                            </SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tax_amount"
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
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platform_fees"
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
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Additional Information
                </h3>
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
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Summary
                </h3>
                <div className="rounded-lg border p-4 space-y-2 text-sm bg-muted/5">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Subtotal
                    </span>
                    <span>${sale.total_revenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Shipping Cost
                    </span>
                    <span>${form.watch("shipping_cost").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Receipt className="h-3 w-3" />
                      Tax Amount
                    </span>
                    <span>${form.watch("tax_amount").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      Platform Fees
                    </span>
                    <span>${form.watch("platform_fees").toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 font-medium flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Total
                    </span>
                    <span>
                      $
                      {(
                        sale.total_revenue +
                        (form.watch("shipping_cost") || 0) +
                        (form.watch("tax_amount") || 0) +
                        (form.watch("platform_fees") || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
