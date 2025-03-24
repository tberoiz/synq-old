"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@synq/ui/use-toast";
import { createClient } from "@synq/supabase/client";
import { fetchCategories } from "@synq/supabase/queries";
import { Button } from "@synq/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { categoryKeys } from "@ui/modules/inventory/items/queries/keys";
import type { InventoryGroup } from "@synq/supabase/types";

const deleteCategorySchema = z.object({
  newCategoryId: z
    .string()
    .min(1, { message: "Please select a new category." }),
});

type DeleteCategoryFormValues = z.infer<typeof deleteCategorySchema>;

interface DeleteCategoryDialogProps {
  categoryId: string;
  categoryName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  open,
  onOpenChange,
}: DeleteCategoryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const form = useForm<DeleteCategoryFormValues>({
    resolver: zodResolver(deleteCategorySchema),
    defaultValues: {
      newCategoryId: "",
    },
  });

  const { data: categories } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => fetchCategories(supabase),
  });

  const onSubmit = async (data: DeleteCategoryFormValues) => {
    try {
      // First, update all items in the category to the new category
      const { error: updateError } = await supabase
        .from("user_inventory_items")
        .update({ inventory_group_id: data.newCategoryId })
        .eq("inventory_group_id", categoryId);

      if (updateError) throw updateError;

      // Then delete the category
      const { error: deleteError } = await supabase
        .from("user_inventory_groups")
        .delete()
        .eq("id", categoryId);

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Category deleted successfully!",
        variant: "default",
      });

      // Invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["inventory_items"] }),
        queryClient.invalidateQueries({ queryKey: ["items_view"] }),
      ]);

      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const availableCategories = categories?.filter(
    (category: InventoryGroup) => category.id !== categoryId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="text-sm text-muted-foreground">
              You are about to delete the category "{categoryName}". Please
              select a new category for all items in this category.
            </div>
            <FormField
              control={form.control}
              name="newCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a new category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent emptyPlaceholder="No other categories available">
                      {availableCategories?.map((category: InventoryGroup) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={
                  !availableCategories || availableCategories.length === 0
                }
              >
                Delete Category
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
