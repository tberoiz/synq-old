"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@synq/ui/use-toast";
import { deleteInventoryBatch } from "@synq/supabase/queries/inventory";
import { BatchRowSettingsDropdown } from "@ui/dropdowns/batch-row-settings-dropdown";
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

interface BatchSettingsButtonProps {
  batchId: string;
}

export const BatchRowSettingsButton = ({
  batchId,
}: BatchSettingsButtonProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDeleteBatch = async () => {
    try {
      await deleteInventoryBatch(batchId);
      queryClient.invalidateQueries({ queryKey: ["user_inventory_batches"] });
      toast({
        title: "Batch deleted",
        description: "The batch was successfully deleted.",
        variant: "default",
      });
      setIsDeleteDialogOpen(false);
    } catch {
      toast({
        title: "Failed to delete batch",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogTrigger asChild>
        <BatchRowSettingsDropdown
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
          <AlertDialogAction
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteBatch();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
