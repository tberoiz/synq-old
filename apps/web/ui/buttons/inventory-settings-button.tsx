"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@synq/ui/use-toast";
import { deleteInventoryGroup } from "@synq/supabase/queries/inventory";
import { DeleteInventoryDialog } from "@ui/dialog/delete-inventory-dialog";
import { InventoryDropdownMenu } from "@ui/dropdowns/inventory-dropdown-menu";

interface InventorySettingsButtonProps {
  inventoryId: string;
}

export const InventorySettingsButton = ({ inventoryId }: InventorySettingsButtonProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDeleteInventory = async () => {
    try {
      await deleteInventoryGroup(inventoryId);
      queryClient.invalidateQueries({ queryKey: ["inventory_groups"] });
      toast({
        title: "Inventory deleted",
        description: "The inventory was successfully deleted.",
        variant: "default",
      });
      setIsDeleteDialogOpen(false);
    } catch {
      toast({
        title: "Failed to delete inventory",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <InventoryDropdownMenu onDeleteClick={() => setIsDeleteDialogOpen(true)} />
      <DeleteInventoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteInventory}
      />
    </>
  );
};
