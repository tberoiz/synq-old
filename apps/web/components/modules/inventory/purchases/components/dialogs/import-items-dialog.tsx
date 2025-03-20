"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@synq/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@synq/ui/dialog";
import { ImportItem } from "@synq/supabase/types";
import { Plus, Loader2 } from "lucide-react";
import ImportItemsTable from "../tables/import-items-table";
import { useToast } from "@synq/ui/use-toast";

interface ImportItemsDialogProps {
  title: string;
  onImport: (selectedItems: ImportItem[]) => Promise<void>;
}

export function ImportItemsDialog({ title, onImport }: ImportItemsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ImportItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) setSelectedItems([]);
  }, [open]);

  const handleImport = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to import.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      await onImport(selectedItems);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  }, [selectedItems, onImport, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="text-sm">
          <Plus className="h-3 w-3 mr-2" />
          Add Items
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col">
        <DialogHeader className="flex-none">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Select items from the list below to import into your purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ImportItemsTable onSelectionChange={setSelectedItems} />
        </div>

        <DialogFooter className="flex-none flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleImport}
            disabled={selectedItems.length === 0 || isImporting}
            className="w-full sm:w-auto"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              `Import ${selectedItems.length} Item${selectedItems.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
