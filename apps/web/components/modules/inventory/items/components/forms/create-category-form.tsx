"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@synq/ui/use-toast";
import { getUserId } from "@synq/supabase/queries";
import { createClient } from "@synq/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synq/ui/form";
import { DialogClose, DialogFooter } from "@synq/ui/dialog";
import { categoryKeys } from "@ui/modules/inventory/items/queries/keys";

const categorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters." }),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export interface CreateCategoryFormProps {
  onSuccess?: () => void;
}

export function CreateCategoryForm({ onSuccess }: CreateCategoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { data: userId } = useQuery({
    queryKey: ["user_id"],
    queryFn: getUserId,
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("user_inventory_groups").insert({
        name: data.name,
        user_id: userId,
      });

      if (error) throw error;

      form.reset();
      toast({
        title: "Success",
        description: "Category created successfully!",
        variant: "default",
      });

      // Invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
      ]);

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
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
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={!userId}>
            Create Category
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
