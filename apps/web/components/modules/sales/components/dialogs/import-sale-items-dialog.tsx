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
import { Plus, Loader2 } from "lucide-react";

import { useToast } from "@synq/ui/use-toast";
import { type SaleItemWithDetails } from "@synq/supabase/types";
import { ImportSaleItemsTable } from "../tables/import-sale-items-table";

interface ImportSaleItemsDialogProps {
  title: string;
  onImport: (selectedItems: SaleItemWithDetails[]) => Promise<void>;
}

export function ImportSaleItemsDialog({ title, onImport }: ImportSaleItemsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SaleItemWithDetails[]>([]);
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
            Select items from your purchases to add to this sale. You can adjust the quantity and sale price for each item.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ImportSaleItemsTable onSelectionChange={setSelectedItems} />
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