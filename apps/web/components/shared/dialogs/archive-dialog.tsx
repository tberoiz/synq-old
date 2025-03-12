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

interface UseArchiveDialogProps<T> {
  onArchive?: (item: T) => void;
  queryKey?: string[];
}

interface ArchiveDialogProps<T> {
  title?: string;
  description?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onArchive: (item: T) => Promise<void>;
  selectedItem: T | null;
  queryKey?: string[];
}

export function useArchiveDialog<T>({
  queryKey,
  onArchive,
}: UseArchiveDialogProps<T> = {}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<T | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const archiveMutation = useMutation({
    mutationFn: async (itemToArchive: T) => {
      if (onArchive) {
        await onArchive(itemToArchive);
      }
    },
    onSuccess: () => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
      toast({
        title: "Success",
        description: "Item archived successfully",
      });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      console.error("Error archiving item:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to archive item",
        variant: "destructive",
      });
    },
  });

  const handleArchive = (item: T) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  return {
    isOpen,
    setIsOpen,
    selectedItem,
    handleArchive,
    archiveMutation,
  };
}

export function ArchiveDialog<T>({
  title = "Archive Item",
  description = "Are you sure you want to archive this item? This action can be undone later.",
  isOpen,
  onOpenChange,
  onArchive,
  selectedItem,
  queryKey,
}: ArchiveDialogProps<T>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const archiveMutation = useMutation({
    mutationFn: onArchive,
    onSuccess: () => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
      toast({
        title: "Success",
        description: "Item archived successfully",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      console.error("Error archiving item:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to archive item",
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
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              if (selectedItem) {
                e.preventDefault();
                archiveMutation.mutate(selectedItem);
              }
            }}
          >
            Archive
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
