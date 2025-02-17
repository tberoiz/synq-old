"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@synq/ui/dialog";
import { Button } from "@synq/ui/button";
import { Plus } from "lucide-react";

import { CreateInventoryForm } from "@ui/forms/inventory/create-inventory-form";

export const AddInventoryDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button className="text-sm">
        <Plus className="h-3 w-3 mr-1" />
        Add Inventory
      </Button>
    </DialogTrigger>

    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">Add New Inventory</DialogTitle>
      </DialogHeader>
      <CreateInventoryForm />
    </DialogContent>
  </Dialog>
);
