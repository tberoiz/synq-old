"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createSaleSchema, type CreateSaleInput } from "@synq/supabase/types";
import { useToast } from "@synq/ui/use-toast";
import { Button } from "@synq/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@synq/ui/dialog";
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
import { PlusIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
import { format } from "date-fns";
import { SaleItemsTable } from "./sale-items-table";
import { createSale, getUserId } from "@synq/supabase/queries";
import { createClient } from "@synq/supabase/client";
import { cn } from "@synq/ui/utils";

const steps = [
  { id: 'items', title: 'Select Items' },
  { id: 'details', title: 'Sale Details' },
  { id: 'review', title: 'Review & Create' }
] as const;

type Step = typeof steps[number]['id'];

export function CreateSaleDialog() {
  const [open, setOpen] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<Step>('items');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const supabase = createClient();

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

  const items = form.watch('items');
  const canProceed = React.useMemo(() => {
    switch (currentStep) {
      case 'items':
        return items.length > 0;
      case 'details':
        return form.watch('platform') && form.watch('status');
      case 'review':
        return true;
      default:
        return false;
    }
  }, [currentStep, items.length, form]);

  const { mutate: handleSubmit, isPending } = useMutation({
    mutationFn: async (data: CreateSaleInput) => {
      const userId = await getUserId();
      if (!userId) throw new Error("User ID not found");
      
      const sale = await createSale(
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
        }))
      );
      
      return sale;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({
        title: "Sale created",
        description: "Your sale has been created successfully.",
      });
      setOpen(false);
      form.reset();
      setCurrentStep('items');
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

  const onNext = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]!.id);
    }
  };

  const onPrevious = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]!.id);
    }
  };

  const calculateTotals = React.useMemo(() => {
    return items.reduce((acc, item) => {
      const subtotal = (item.quantity || 0) * (item.salePrice || 0);
      return {
        subtotal: acc.subtotal + subtotal,
        totalItems: acc.totalItems + (item.quantity || 0),
      };
    }, { subtotal: 0, totalItems: 0 });
  }, [items]);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        form.reset();
        setCurrentStep('items');
      }
      setOpen(newOpen);
    }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <PlusIcon className="h-4 w-4" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Sale</DialogTitle>
          <DialogDescription>
            Add a new sale to your inventory.
          </DialogDescription>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="relative mb-8">
          <div className="absolute top-4 w-full h-0.5 bg-muted"></div>
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-colors",
                  currentStep === step.id ? "bg-primary text-primary-foreground" :
                  index < steps.findIndex(s => s.id === currentStep) ? "bg-primary/80 text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                )}>
                  {index < steps.findIndex(s => s.id === currentStep) ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-sm mt-2">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => handleSubmit(data))}
            className="space-y-4"
          >
            <div className="min-h-[400px]">
              {currentStep === 'items' && (
                <div className="space-y-4">
                  <SaleItemsTable />
                  {items.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Selected {items.length} unique items ({calculateTotals.totalItems} total)
                    </div>
                  )}
                </div>
              )}

              {currentStep === 'details' && (
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a platform" />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="listed">Listed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="saleDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={
                              field.value ? format(field.value, "yyyy-MM-dd") : ""
                            }
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Cost</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="platformFees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform Fees</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any notes about this sale..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentStep === 'review' && (
                <div className="space-y-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Sale Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Items</span>
                        <span>{items.length} unique items ({calculateTotals.totalItems} total)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${calculateTotals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform</span>
                        <span className="capitalize">{form.watch('platform')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <span className="capitalize">{form.watch('status')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Cost</span>
                        <span>${form.watch('shippingCost').toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax Amount</span>
                        <span>${form.watch('taxAmount').toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fees</span>
                        <span>${form.watch('platformFees').toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2 font-medium flex justify-between">
                        <span>Total</span>
                        <span>${(
                          calculateTotals.subtotal + 
                          (form.watch('shippingCost') || 0) + 
                          (form.watch('taxAmount') || 0) + 
                          (form.watch('platformFees') || 0)
                        ).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Please review all details before creating the sale. This action cannot be undone.
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 gap-2">
              {currentStep !== 'items' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrevious}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              
              {currentStep === 'items' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
              )}

              {currentStep !== 'review' ? (
                <Button
                  type="button"
                  onClick={onNext}
                  disabled={!canProceed}
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Sale"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
