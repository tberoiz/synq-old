// REACT
import { useState, useCallback, useImperativeHandle, forwardRef, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// TYPES
import { type SaleItemWithDetails } from "@synq/supabase/types";

// UI COMPONENTS
import { Button } from "@synq/ui/button";
import { useToast } from "@synq/ui/use-toast";
import { Save } from "lucide-react";
import { DataTable } from "@ui/shared/components/data-table/data-table";

// HOOKS & QUERIES
import { useSaleItemsColumns } from "../../hooks/use-sale-items-columns";
import { useSaleMutations, useSaleItemsQuery } from "../../queries/sales";

// COMPONENTS
import { ImportSaleItemsDialog } from "../dialogs/import-sale-items-dialog";

// Define the ref interface for table operations
export interface SaleItemsTableRef {
  getUpdates: () => Map<string, { quantity?: number; price?: number }>;
  applyUpdates: (updates: Map<string, { quantity?: number; price?: number }>) => void;
  resetUpdates: () => void;
}

interface SaleItemsTableProps {
  saleId?: string;
  showImportButton?: boolean;
  onUpdateItem?: (updates: Record<string, { quantity?: number; price?: number }>) => void;
  isEditable?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  hideSaveButton?: boolean;
}

const SaleItemsTable = forwardRef<SaleItemsTableRef, SaleItemsTableProps>(({
  saleId,
  onUpdateItem,
  isEditable = false,
  showImportButton,
  onDirtyChange,
  hideSaveButton = false,
}, ref) => {
  const { toast } = useToast();
  const { addItems, update } = useSaleMutations();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  
  // Store local changes in state so they can survive re-renders
  const [localChanges, setLocalChanges] = 
    useState<Record<string, { quantity?: number; price?: number }>>({});
  
  // Derive dirty state from localChanges
  const isDirty = Object.keys(localChanges).length > 0;
  
  // Trigger the onDirtyChange callback when isDirty changes
  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);
  
  // Fetch items data
  const { data: serverItems, isLoading, refetch } = useSaleItemsQuery(saleId ?? null);
  
  // Merge server items with local changes for display
  const items = useMemo(() => {
    if (!serverItems) return [];
    
    // Create a copy of server items
    return serverItems.map(item => {
      const changes = localChanges[item.id];
      if (!changes) return item;
      
      // Apply local changes if they exist
      return {
        ...item,
        sold_quantity: changes.quantity !== undefined ? changes.quantity : item.sold_quantity,
        sale_price: changes.price !== undefined ? changes.price : item.sale_price
      };
    });
  }, [serverItems, localChanges]);
  
  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    getUpdates: () => {
      // Convert the changes object to a Map
      const updatesMap = new Map<string, { quantity?: number; price?: number }>();
      Object.entries(localChanges).forEach(([id, changes]) => {
        updatesMap.set(id, changes);
      });
      return updatesMap;
    },
    applyUpdates: (updates) => {
      // Convert the Map to an object and merge with existing changes
      const newChanges = { ...localChanges };
      updates.forEach((value, key) => {
        newChanges[key] = { ...(newChanges[key] || {}), ...value };
      });
      setLocalChanges(newChanges);
    },
    resetUpdates: () => {
      setLocalChanges({});
    }
  }), [localChanges]);

  const handleLocalUpdate = useCallback((itemId: string, updates: { quantity?: number; price?: number }) => {
    setLocalChanges(prev => {
      const existing = prev[itemId] || {};
      const merged = { ...existing, ...updates };
      
      // Check if the update would result in the same values as the server
      const serverItem = serverItems?.find(item => item.id === itemId);
      if (serverItem) {
        const quantityUnchanged = merged.quantity === undefined || 
          merged.quantity === serverItem.sold_quantity;
        const priceUnchanged = merged.price === undefined || 
          merged.price === serverItem.sale_price;
        
        // If both quantity and price are unchanged from server values, remove this item
        if (quantityUnchanged && priceUnchanged) {
          const { [itemId]: _, ...rest } = prev;
          return rest;
        }
      }
      
      return {
        ...prev,
        [itemId]: merged
      };
    });
  }, [serverItems]);

  const handleSaveChanges = useCallback(async () => {
    if (!saleId || !serverItems || !isDirty) return;
    
    try {
      setIsSaving(true);
      
      // Convert our local changes to the format expected by the API
      const updatesArray = Object.entries(localChanges)
        .map(([itemId, changes]) => {
          const item = serverItems.find(i => i.id === itemId);
          if (!item) return null;
          
          return {
            id: itemId,
            purchase_item_id: item.purchase_item_id,
            sold_quantity: changes.quantity !== undefined ? changes.quantity : item.sold_quantity,
            sale_price: changes.price !== undefined ? changes.price : item.sale_price
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
      
      if (updatesArray.length > 0) {
        // Perform the update
        await update.mutate({
          saleId,
          updates: {
            items: updatesArray.map(item => ({
              id: item.id,
              purchaseItemId: item.purchase_item_id,
              quantity: item.sold_quantity,
              salePrice: item.sale_price
            }))
          }
        });
        
        // Wait for server processing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Notify the parent component about the updates
        if (onUpdateItem) {
          onUpdateItem(localChanges);
        }
        
        // After successful save, clear all local changes
        setLocalChanges({});
        
        // Force refetch to get the latest data
        await refetch();
        
        toast({
          title: "Success",
          description: "Changes saved successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
      console.error("Failed to save changes:", error);
    } finally {
      setIsSaving(false);
    }
  }, [saleId, serverItems, localChanges, isDirty, update, onUpdateItem, refetch, toast]);

  const handleImportItems = useCallback(async (items: SaleItemWithDetails[]) => {
    if (!saleId) return;

    try {
      await addItems.mutate({
        saleId,
        items,
      });
      
      // Force refetch after import
      await refetch();
      
      toast({
        title: "Success",
        description: "Items added to sale successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add items to sale",
        variant: "destructive",
      });
    }
  }, [saleId, addItems, refetch, toast]);
  
  // Create columns with the localChanges for proper display
  const columns = useSaleItemsColumns({
    onUpdateItem: handleLocalUpdate,
    isEditable,
    localChanges,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center min-h-[40px]">
        {isEditable && isDirty && !hideSaveButton && (
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>
      <DataTable
        columns={columns}
        data={items}
        enableRowSelection={false}
        searchPlaceholder="Search items..."
        isLoading={isLoading}
        actions={showImportButton ? (
          <ImportSaleItemsDialog
            title="Add Items to Sale"
            onImport={handleImportItems}
          />
        ) : undefined}
      />
    </div>
  );
});

SaleItemsTable.displayName = "SaleItemsTable";

export default SaleItemsTable;
