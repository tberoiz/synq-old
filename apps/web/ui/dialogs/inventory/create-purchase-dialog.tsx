"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@synq/ui/dialog";
import { Plus } from "lucide-react";
import CreatePurchaseForm from "@ui/forms/inventory/create-purchase-form";
import { Button } from "@synq/ui/button";
import { useRef } from "react";

interface CreatePurchaseDialogProps {
  onSuccess?: (purchase: any) => void;
}

export const CreatePurchaseDialog = ({
  onSuccess,
}: CreatePurchaseDialogProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleSuccess = (purchase: any) => {
    closeButtonRef.current?.click();
    onSuccess?.(purchase);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Purchase
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Add New Purchase
          </DialogTitle>
        </DialogHeader>
        <CreatePurchaseForm onSuccess={handleSuccess} />
        <DialogClose ref={closeButtonRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};
