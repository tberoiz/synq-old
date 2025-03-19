"use client";

import { useState, useCallback } from "react";
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
  items: ImportItem[];
  title: string;
  actions?: React.ReactNode;
  onImport: (selectedItems: ImportItem[]) => void;
  loading?: boolean;
}

export function ImportItemsDialog({
  items,
  title,
  onImport,
  loading = false,
}: ImportItemsDialogProps) {
  const [selectedItems, setSelectedItems] = useState<ImportItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

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
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="text-sm">
          <Plus className="h-3 w-3 mr-2" />
          Add Items
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl h-[90vh] sm:h-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Select items from the list below to import into your purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex-1 overflow-hidden">
          <ImportItemsTable
            data={items}
            loading={loading}
            onSelectionChange={setSelectedItems}
          />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
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
                `Import ${selectedItems.length} Items`
              )}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
