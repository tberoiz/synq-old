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
import { UserItem } from "@synq/supabase/models/inventory";
import ItemsDataTable from "@ui/data-tables/inventory/items-data-table";
import { Plus } from "lucide-react";

interface ImportItemsDialogProps {
  items: UserItem[];
  title: string;
  actions?: React.ReactNode;
  onImport: (selectedItems: UserItem[]) => void;
}

export function ImportItemsDialog({
  items,
  title,
  actions,
  onImport,
}: ImportItemsDialogProps) {
  const [selectedItems, setSelectedItems] = useState<UserItem[]>([]);

  const handleImport = () => {
    onImport(selectedItems);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="text-sm">
            <Plus className="h-3 w-3 mr-2" />
            Add Items
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <ItemsDataTable
              data={items}
              loading={false}
              actions={actions}
              onSelectionChange={(selectedItems) =>
                setSelectedItems(selectedItems)
              }
            />
          </div>

          <DialogFooter>
            <DialogClose asChild className="space-x-2">
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild className="space-x-2">
              <Button
                onClick={handleImport}
                disabled={selectedItems.length === 0}
              >
                Import {selectedItems.length} Items
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
