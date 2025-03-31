"use client";

// REACT
import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

// FORM
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// API
import { type SaleDetails } from "@synq/supabase/types";

// UI COMPONENTS
import { Form } from "@synq/ui/form";

// SHARED COMPONENTS
import { NumberInput } from "@ui/shared/forms/number-input";
import { DateInput } from "@ui/shared/forms/date-input";
import { SelectInput } from "@ui/shared/forms/select-input";
import { TextareaInput } from "@ui/shared/forms/textarea-input";

// ICONS
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

export function EditSaleForm({ sale, onSubmit, onFormStateChange }: EditSaleFormProps) {
  const form = useForm<UpdateSaleFormData>({
    resolver: zodResolver(UPDATE_SALE_SCHEMA),
    defaultValues: {
      status: sale.status,
      platform: sale.platform,
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
      onFormStateChange?.(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form, onFormStateChange]);

  const statusIcon = {
    completed: <CheckCircle2 className="h-3 w-3 text-green-500" />,
    cancelled: <XCircle className="h-3 w-3 text-red-500" />,
    listed: <Clock className="h-3 w-3 text-blue-500" />,
  }[form.watch("status")];

  return (
    <Form {...form}>
      <form
        id="edit-sale-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full flex flex-col overflow-y-auto p-6 space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <SelectInput
                  control={form.control}
                  name="platform"
                  label="Platform"
                  icon={<Tag className="h-3 w-3" />}
                  options={[
                    { id: "ebay", name: "eBay" },
                    { id: "amazon", name: "Amazon" },
                    { id: "etsy", name: "Etsy" },
                    { id: "shopify", name: "Shopify" },
                    { id: "other", name: "Other" },
                  ]}
                  placeholder="Select platform"
                />

                <SelectInput
                  control={form.control}
                  name="status"
                  label="Status"
                  icon={statusIcon}
                  options={[
                    { id: "listed", name: "Listed" },
                    { id: "completed", name: "Completed" },
                    { id: "cancelled", name: "Cancelled" },
                  ]}
                  placeholder="Select status"
                />

                <DateInput
                  control={form.control}
                  name="sale_date"
                  label="Sale Date"
                  icon={<Calendar className="h-3 w-3" />}
                />

                <NumberInput
                  control={form.control}
                  name="shipping_cost"
                  label="Shipping Cost"
                  icon={<Truck className="h-3 w-3" />}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Tax Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <NumberInput
                  control={form.control}
                  name="tax_rate"
                  label="Tax Rate"
                  icon={<Receipt className="h-3 w-3" />}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                />

                <SelectInput
                  control={form.control}
                  name="tax_type"
                  label="Tax Type"
                  icon={<Receipt className="h-3 w-3" />}
                  options={[
                    { id: "percentage", name: "Percentage" },
                    { id: "fixed", name: "Fixed Amount" },
                  ]}
                  placeholder="Select type"
                />

                <NumberInput
                  control={form.control}
                  name="tax_amount"
                  label="Tax Amount"
                  icon={<Receipt className="h-3 w-3" />}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                />

                <NumberInput
                  control={form.control}
                  name="platform_fees"
                  label="Platform Fees"
                  icon={<CreditCard className="h-3 w-3" />}
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Additional Information</h3>
              <TextareaInput
                control={form.control}
                name="notes"
                label="Notes"
                icon={<FileText className="h-4 w-4" />}
                placeholder="Add any notes about this sale..."
                className="h-64 resize-none"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Summary</h3>
              <div className="border rounded-lg p-4 space-y-2 text-sm bg-muted/5">
                {[
                  { label: "Subtotal", icon: <DollarSign className="h-3 w-3" />, value: sale.total_revenue },
                  { label: "Shipping Cost", icon: <Truck className="h-3 w-3" />, value: form.watch("shipping_cost") },
                  { label: "Tax Amount", icon: <Receipt className="h-3 w-3" />, value: form.watch("tax_amount") },
                  { label: "Platform Fees", icon: <CreditCard className="h-3 w-3" />, value: form.watch("platform_fees") },
                ].map(({ label, icon, value }, index) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      {icon}
                      {label}
                    </span>
                    <span>${value.toFixed(2)}</span>
                  </div>
                ))}

                <div className="border-t pt-2 mt-2 font-medium flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Total
                  </span>
                  <span>
                    ${(
                      sale.total_revenue +
                      form.watch("shipping_cost") +
                      form.watch("tax_amount") +
                      form.watch("platform_fees")
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}