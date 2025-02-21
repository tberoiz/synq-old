"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@synq/ui/dialog";
import { Button } from "@synq/ui/button";
import { Plus } from "lucide-react";

import { CreateCollectionForm } from "@ui/forms/inventory/create-collection-form";

export const AddNewCollectionDialog = ({
  trigger,
}: {
  trigger?: ReactNode;
}) => (
  <Dialog>
    {trigger || (
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-sm">
          <Plus className="h-3 w-3 mr-1" />
          Create a new Collection
        </Button>
      </DialogTrigger>
    )}

    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Create a New Collection
        </DialogTitle>
      </DialogHeader>
      <CreateCollectionForm />
    </DialogContent>
  </Dialog>
);
