"use client";

import * as React from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@synq/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@synq/ui/dialog";
import { Button } from "@synq/ui/button";

interface UseRestoreDialogProps<T> {
  onRestore?: (item: T) => void;
  queryKey?: string[];
}

interface RestoreDialogProps<T> {
  title?: string;
  description?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: (item: T) => Promise<void>;
  selectedItem: T | null;
  queryKey?: string[];
}

export function useRestoreDialog<T>({ queryKey, onRestore }: UseRestoreDialogProps<T> = {}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<T | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const restoreMutation = useMutation({
    mutationFn: async (itemToRestore: T) => {
      if (onRestore) {
        await onRestore(itemToRestore);
      }
    },
    onSuccess: () => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
      toast({
        title: "Success",
        description: "Item restored successfully",
      });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      console.error("Error restoring item:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to restore item",
        variant: "destructive",
      });
    },
  });

  const handleRestore = (item: T) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  return {
    isOpen,
    setIsOpen,
    selectedItem,
    handleRestore,
    restoreMutation,
  };
}

export function RestoreDialog<T>({
  title = "Restore Item",
  description = "Are you sure you want to restore this item?",
  isOpen,
  onOpenChange,
  onRestore,
  selectedItem,
  queryKey,
}: RestoreDialogProps<T>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const restoreMutation = useMutation({
    mutationFn: onRestore,
    onSuccess: () => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
      toast({
        title: "Success",
        description: "Item restored successfully",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Error restoring item:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to restore item",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              if (selectedItem) {
                e.preventDefault();
                restoreMutation.mutate(selectedItem);
              }
            }}
          >
            Restore
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
