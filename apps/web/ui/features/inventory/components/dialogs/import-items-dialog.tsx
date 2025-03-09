"use client";

import { useState } from "react";
import { Button } from "@synq/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@synq/ui/dialog";
import { InventoryItemWithDetails } from "@synq/supabase/queries";
import { Plus } from "lucide-react";
import ImportItemsTable from "@ui/primitives/data-table/inventory/import-items-table";

interface ImportItemsDialogProps {
  items: InventoryItemWithDetails[];
  title: string;
  actions?: React.ReactNode;
  onImport: (selectedItems: InventoryItemWithDetails[]) => void;
  loading?: boolean;
}

export function ImportItemsDialog({
  items,
  title,
  actions,
  onImport,
  loading = false,
}: ImportItemsDialogProps) {
  const [selectedItems, setSelectedItems] = useState<
    InventoryItemWithDetails[]
  >([]);

  const handleImport = () => {
    onImport(selectedItems);
  };

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
              disabled={selectedItems.length === 0}
              className="w-full sm:w-auto"
            >
              Import {selectedItems.length} Items
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
