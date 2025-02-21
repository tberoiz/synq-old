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

import { CreateBatchForm } from "@ui/forms/inventory/create-batch-form";

export const AddNewBatchDialog = ({ trigger }: { trigger?: ReactNode }) => (
  <Dialog>
    {trigger || (
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-sm">
          <Plus className="h-3 w-3 mr-1" />
          Create a new Batch
        </Button>
      </DialogTrigger>
    )}

    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Create a New Batch
        </DialogTitle>
      </DialogHeader>
      <CreateBatchForm />
    </DialogContent>
  </Dialog>
);
