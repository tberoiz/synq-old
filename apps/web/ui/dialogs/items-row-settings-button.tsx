"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@synq/ui/use-toast";
import { deleteInventoryItem } from "@synq/supabase/queries/inventory";
import { ItemRowSettingsDropdown } from "@ui/dropdowns/items-row-settings-dropdown";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@synq/ui/alert-dialog";

interface ItemSettingsButtonProps {
  itemId: string;
}

export const ItemRowSettingsButton = ({ itemId }: ItemSettingsButtonProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDeleteItem = async () => {
    try {
      await deleteInventoryItem(itemId);
      queryClient.invalidateQueries({ queryKey: ["user_inventory_items"] });
      toast({
        title: "Item deleted",
        description: "The item was successfully deleted.",
        variant: "default",
      });
      setIsDeleteDialogOpen(false);
    } catch {
      toast({
        title: "Failed to delete item",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogTrigger asChild>
        <ItemRowSettingsDropdown
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the item.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteItem}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
