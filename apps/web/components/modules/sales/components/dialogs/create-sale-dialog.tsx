"use client";

// REACT
import * as React from "react";

// UI COMPONENTS
import { Button } from "@synq/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@synq/ui/dialog";
import { PlusIcon, ShoppingCart } from "lucide-react";

// SHARED COMPONENTS
import { CircularSpinner } from "@ui/shared/components/spinners/circular-spinner";
import { CreateSaleForm } from "../forms/create-sale-form";

// API
import { useCreateSaleMutation } from "../../queries/sales";

export function CreateSaleDialog() {
  const [open, setOpen] = React.useState(false);
  const { isPending } = useCreateSaleMutation();
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setOpen(false);
        }
        setOpen(newOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <PlusIcon className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Create New Sale
          </DialogTitle>
          <DialogDescription>
            Add a new sale to your inventory.
          </DialogDescription>
        </DialogHeader>

        <CreateSaleForm onSuccess={() => setOpen(false)} formRef={formRef} />

        <DialogFooter className="mt-4 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="min-w-[120px]"
          >
            {isPending ? (
              <>
                <CircularSpinner size="sm" className="mr-2" />
                Creating...
              </>
            ) : (
              "Create Sale"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
