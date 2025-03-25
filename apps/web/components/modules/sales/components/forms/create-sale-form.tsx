"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { type CreateSaleInput } from "@synq/supabase/types";
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
import { Tag, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@synq/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@synq/ui/popover";
import { Button } from "@synq/ui/button";
import { cn } from "@synq/ui/utils";
import { SaleItemsTable } from "../dialogs/sale-items-table";

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
  onSubmit: (data: CreateSaleInput) => Promise<void>;
  isPending?: boolean;
}

export function CreateSaleForm({ onSubmit, isPending }: CreateSaleFormProps) {
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

  return (
    <Form {...form}>
      <form
        id="create-sale-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        <div className="flex-1 overflow-y-auto space-y-6 p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Basic Information
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Platform
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
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
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Status
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
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
                  name="saleDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        Sale Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full h-8 pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            className="rounded-md border"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
