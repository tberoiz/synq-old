"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { SaleTableRow } from "@synq/supabase/types";
import { Sheet } from "@synq/ui/sheet";
import { CreateSaleDialog } from "@ui/modules/sales/components/dialogs/create-sale-dialog";
import SaleDetailsSheet from "@ui/modules/sales/components/sheets/sale-details-sheet";
import { DataTable } from "@ui/shared/components/data-table/data-table";
import { useSaleColumns } from "../../hooks/use-sales-columns";
import { DeleteActionDialog } from "@ui/shared/components/dialogs/delete-action-dialog";
import { Button } from "@synq/ui/button";
import { Trash2 } from "lucide-react";
import { useSaleMutations, useSalesInfiniteQuery } from "../../queries/sales";
import { useToast } from "@synq/ui/use-toast";

interface SalesTableProps {
  initialData: SaleTableRow[];
}

export function SalesTable({ initialData }: SalesTableProps) {
  const { toast } = useToast();
  const [selectedSaleId, setSelectedSaleId] = React.useState<string | null>(null);
  const [selectedSales, setSelectedSales] = React.useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = React.useState<"delete" | "bulk_delete" | null>(null);
  const [deleteSaleId, setDeleteSaleId] = React.useState<string | null>(null);
  const { bulkDelete, delete: deleteMutation } = useSaleMutations();
  const columns: ColumnDef<SaleTableRow>[] = useSaleColumns({
    onDelete: (saleId) => {
      setDeleteSaleId(saleId);
      setShowDeleteDialog("delete");
    },
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSalesInfiniteQuery();

  const allSales = React.useMemo(() => {
    if (!data?.pages) return initialData || [];
    return data.pages.flatMap((page) => page.data) || [];
  }, [data, initialData]);

  const handleDelete = async () => {
    if (!showDeleteDialog) return;

    try {
      if (showDeleteDialog === "bulk_delete") {
        await bulkDelete.mutate(Array.from(selectedSales));
        toast({
          title: "Success",
          description: `${selectedSales.size} sales deleted successfully`,
        });
      } else if (showDeleteDialog === "delete" && deleteSaleId) {
        await deleteMutation.mutate(deleteSaleId);
        toast({
          title: "Success",
          description: "Sale deleted successfully",
        });
      }
      setSelectedSales(new Set());
      setShowDeleteDialog(null);
      setDeleteSaleId(null);
    } catch (error) {
      console.error("Error deleting sales:", error);
      toast({
        title: "Error",
        description: "Failed to delete sales",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={allSales}
        searchPlaceholder="Filter sales..."
        searchColumn="sale_date"
        onRowClick={(sale) => {
          const target = event?.target as HTMLElement;
          if (target?.closest('[role="checkbox"]') || target?.closest('button')) return;
          setSelectedSaleId(sale.id);
        }}
        actions={
          <div className="flex items-center gap-2">
            {selectedSales.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => setShowDeleteDialog("bulk_delete")}
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedSales.size})
              </Button>
            )}
            <CreateSaleDialog />
          </div>
        }
        enableRowSelection={true}
        selectedRows={allSales.filter((sale) => selectedSales.has(sale.id))}
        onRowSelectionChange={(rows: SaleTableRow[]) => {
          setSelectedSales(new Set(rows.map((row) => row.id)));
        }}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />

      <Sheet
        open={!!selectedSaleId}
        onOpenChange={(open: boolean) => !open && setSelectedSaleId(null)}
      >
        <SaleDetailsSheet
          saleId={selectedSaleId}
          onOpenChange={(open: boolean) => !open && setSelectedSaleId(null)}
        />
      </Sheet>

      <DeleteActionDialog
        isOpen={!!showDeleteDialog}
        onOpenChange={(open: boolean) => !open && setShowDeleteDialog(null)}
        actionType={showDeleteDialog}
        onConfirm={handleDelete}
        title={showDeleteDialog === "bulk_delete" ? `Delete ${selectedSales.size} sales?` : "Delete sale?"}
        description={showDeleteDialog === "bulk_delete"
          ? `Are you sure you want to delete ${selectedSales.size} sales? This action cannot be undone.`
          : "Are you sure you want to delete this sale? This action cannot be undone."}
      />
    </>
  );
}
