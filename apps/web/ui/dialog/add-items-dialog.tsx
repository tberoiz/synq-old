"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@synq/ui/dialog";
import { Button } from "@synq/ui/button";
import { Plus } from "lucide-react";

import { CreateItemForm } from "@ui/forms/item/create-item-form";

export const AddItemDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button className="text-sm">
        <Plus className="h-3 w-3 mr-1" />
        Add Items
      </Button>
    </DialogTrigger>

    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">Add New Item</DialogTitle>
      </DialogHeader>
      <CreateItemForm />
    </DialogContent>
  </Dialog>
);
