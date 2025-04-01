"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@synq/supabase/client";
import { fetchCategories } from "@synq/supabase/queries";
import { CreateCategoryForm } from "@ui/modules/inventory/items/components/forms/create-category-form";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { Button } from "@synq/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@synq/ui/dialog";
import { ScrollArea } from "@synq/ui/scroll-area";
import { Separator } from "@synq/ui/separator";
import { useState } from "react";
import type { InventoryGroup } from "@synq/supabase/types";
import { categoryKeys } from "@ui/modules/inventory/items/queries/keys";

type CategoriesFormProps = {
  initialData?: InventoryGroup[];
};

export function CategoriesForm({ initialData }: CategoriesFormProps) {
  const supabase = createClient();
  const { data: categories, isLoading } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => fetchCategories(supabase),
    initialData,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<InventoryGroup | null>(null);

  const handleDeleteClick = (category: InventoryGroup) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <CreateCategoryForm />
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      <ScrollArea className="h-[200px] rounded-md border p-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading categories...</div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between py-2 border-b"
              >
                <span className="text-sm">{category.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(category)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No categories found. Create one to get started.
          </div>
        )}
      </ScrollArea>

      {categoryToDelete && (
        <DeleteCategoryDialog
          categoryId={categoryToDelete.id}
          categoryName={categoryToDelete.name}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </div>
  );
} 
