"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@synq/ui/use-toast";
import { deleteInventoryCollection } from "@synq/supabase/queries/inventory";
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
import { CollectionsRowSettingsDropdown } from "@ui/dropdowns/collections-row-settings-dropdown";

interface BatchSettingsButtonProps {
  collectionId: string;
}

export const CollectionsRowSettingsButton = ({
  collectionId,
}: BatchSettingsButtonProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDeleteCollection = async () => {
    try {
      await deleteInventoryCollection(collectionId);
      queryClient.invalidateQueries({ queryKey: ["user_inventory_collections"] });
      toast({
        title: "Collection deleted",
        description: "The collection was successfully deleted.",
        variant: "default",
      });
      setIsDeleteDialogOpen(false);
    } catch {
      toast({
        title: "Failed to delete collection",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogTrigger asChild>
        <CollectionsRowSettingsDropdown
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            batch.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => {e.stopPropagation(); handleDeleteCollection()}}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
