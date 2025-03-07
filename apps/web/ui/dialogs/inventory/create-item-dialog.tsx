"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@synq/ui/dialog";
import { Button } from "@synq/ui/button";
import { Plus } from "lucide-react";
import { CreateItemForm } from "@ui/forms/inventory/create-item-form";

export const CreateItemDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm">
        <Plus className="h-4 w-4" />
        New
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Add New Item
        </DialogTitle>
      </DialogHeader>
      <CreateItemForm />
    </DialogContent>
  </Dialog>
);
