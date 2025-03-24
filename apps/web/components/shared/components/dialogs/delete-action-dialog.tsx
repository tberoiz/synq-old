"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@synq/ui/dialog";
import { Button } from "@synq/ui/button";

interface ActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: "delete" | "bulk_delete" | null;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function DeleteActionDialog({
  isOpen,
  onOpenChange,
  actionType,
  onConfirm,
  title,
  description,
}: ActionDialogProps) {
  const defaultTitle =
    actionType === "delete"
      ? "Delete item?"
      : actionType === "bulk_delete"
        ? "Delete selected items?"
        : "";

  const defaultDescription =
    actionType === "delete"
      ? "Are you sure you want to delete this item? This action cannot be undone."
      : actionType === "bulk_delete"
        ? "Are you sure you want to delete the selected items? This action cannot be undone."
        : "";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title || defaultTitle}</DialogTitle>
          <DialogDescription>
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
