"use client";

import * as React from "react";
import { type CreateSaleInput } from "@synq/supabase/types";
import { useToast } from "@synq/ui/use-toast";
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
import { CreateSaleForm } from "../forms/create-sale-form";
import { useCreateSaleMutation } from "../../queries/sales";

export function CreateSaleDialog() {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { mutate: handleSubmit, isPending } = useCreateSaleMutation();

  const onSubmit = async (data: CreateSaleInput) => {
    return new Promise<void>((resolve) => {
      handleSubmit(data, {
        onSuccess: () => {
          toast({
            title: "Sale created",
            description: "Your sale has been created successfully.",
          });
          setOpen(false);
          resolve();
        },
        onError: (error: Error) => {
          console.error("Mutation error:", error);
          toast({
            title: "Error",
            description:
              error.message || "Something went wrong. Please try again.",
            variant: "destructive",
          });
          resolve();
        },
      });
    });
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

        <CreateSaleForm onSubmit={onSubmit} isPending={isPending} />

        <DialogFooter className="mt-4 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="create-sale-form" disabled={isPending}>
            {isPending ? "Creating..." : "Create Sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
