"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { createInventory } from "@synq/supabase/queries/inventory";
import { useToast } from "@synq/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synq/ui/form";
import { DialogClose, DialogFooter } from "@synq/ui/dialog";

const inventorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Inventory name must be at least 2 characters." })
    .max(50, { message: "Inventory name cannot exceed 50 characters." }),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

export const CreateInventoryForm = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (data: InventoryFormValues) => {
    try {
      await createInventory(data.name);
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      form.reset();
      toast({
        title: "Success",
        description: "Inventory created successfully!",
        variant: "default",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating inventory:", error);
      toast({
        title: "Error",
        description: "Failed to create inventory. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inventory Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 'Standard Decks' or 'Rare Cards'"
                  {...field}
                  autoComplete="off"
                  autoCapitalize="none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Create Inventory</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
