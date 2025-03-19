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
import { Archive, RefreshCcw } from "lucide-react";

interface ActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: "archive" | "restore" | null;
  itemId: string | null;
  onConfirm: () => Promise<void>;
  queryKey: string[];
}

export function ActionDialog({
  isOpen,
  onOpenChange,
  actionType,
  itemId,
  onConfirm,
  queryKey,
}: ActionDialogProps) {
  const isArchive = actionType === "archive";
  const title = isArchive ? "Archive Item" : "Restore Item";
  const description = isArchive
    ? "Are you sure you want to archive this item? This action can be undone."
    : "Are you sure you want to restore this item?";
  const confirmText = isArchive ? "Archive" : "Restore";
  const Icon = isArchive ? Archive : RefreshCcw;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
