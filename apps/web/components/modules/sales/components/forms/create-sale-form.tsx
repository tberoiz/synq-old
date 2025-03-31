"use client";

// REACT
import React from "react";
import { useForm } from "react-hook-form";

// FORM
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// UI COMPONENTS
import { Form } from "@synq/ui/form";
import { useToast } from "@synq/ui/use-toast";

// SHARED COMPONENTS
import { SelectInput } from "@ui/shared/forms/select-input";
import { DateInput } from "@ui/shared/forms/date-input";

// QUERIES
import { useCreateSaleMutation } from "../../queries/sales";

const CREATE_SALE_SCHEMA = z.object({
  status: z.enum(["listed", "completed", "cancelled"]),
  platform: z.enum(["ebay", "amazon", "etsy", "shopify", "other"]),
  saleDate: z.date(),
  shippingCost: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  platformFees: z.number().min(0).default(0),
  items: z.array(
    z.object({
      purchaseItemId: z.string(),
      quantity: z.number().min(1),
      salePrice: z.number().min(0),
    })
  ),
});

type CreateSaleFormData = z.infer<typeof CREATE_SALE_SCHEMA>;

interface CreateSaleFormProps {
  onSuccess?: () => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export function CreateSaleForm({ onSuccess, formRef }: CreateSaleFormProps) {
  const { toast } = useToast();
  const { mutate: createSale } = useCreateSaleMutation();

  const form = useForm<CreateSaleFormData>({
    resolver: zodResolver(CREATE_SALE_SCHEMA),
    defaultValues: {
      status: "listed",
      platform: "ebay",
      saleDate: new Date(),
      shippingCost: 0,
      taxAmount: 0,
      platformFees: 0,
      items: [],
    },
  });

  const onSubmit = (data: CreateSaleFormData) => {
    createSale(data, {
      onSuccess: () => {
        toast({
          title: "Sale created",
          description: "Your sale has been created successfully.",
        });
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        id="create-sale-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full space-y-6 p-6"
      >
        <div className="grid grid-cols-3 gap-4">
          <SelectInput
            control={form.control}
            name="platform"
            label="Platform"
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
            options={[
              { id: "listed", name: "Listed" },
              { id: "completed", name: "Completed" },
              { id: "cancelled", name: "Cancelled" },
            ]}
            placeholder="Select status"
          />

          <DateInput
            control={form.control}
            name="saleDate"
            label="Sale Date"
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
          />
        </div>
      </form>
    </Form>
  );
}