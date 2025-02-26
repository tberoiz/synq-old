// NOTE: This File is not being used for now.
"use client";

import { UserAcquisitionBatch } from "@synq/supabase/models/inventory";
import { AcquisitionBatchCard } from "@ui/cards/batch-card";
import { Sheet, SheetTrigger, SheetContent } from "@synq/ui/sheet";
import { BatchDetailsSheet } from "@ui/sheets/inventory/batch-details-sheet";
import { AddNewBatchDialog } from "@ui/dialogs/inventory/add-new-batch-dialog";
import { DialogTrigger } from "@synq/ui/dialog";
import { Button } from "@synq/ui/button";
import { Plus } from "lucide-react";

interface BatchesGridProps {
  data: UserAcquisitionBatch[];
  selectedBatches: UserAcquisitionBatch[];
  onSelectBatch: (item: UserAcquisitionBatch) => void;
}

export function BatchesGrid({
  data,
  selectedBatches,
  onSelectBatch,
}: BatchesGridProps) {
  return (
    <div>
      {/* Grid Items */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data.map((batch) => (
          <Sheet key={batch.id}>
            <SheetTrigger asChild>
              <AcquisitionBatchCard
                key={batch.id}
                id={batch.id}
                name={batch.name || "Unnamed Batch"}
                itemCount={batch.item_count}
                totalCogs={batch.total_cogs}
                totalListingPrice={batch.total_listing_price}
                totalProfit={batch.total_profit}
                isSelected={selectedBatches.some((i) => i.id === batch.id)}
                onSelect={(e) => {
                  e.stopPropagation();
                  onSelectBatch(batch);
                }}
              />
            </SheetTrigger>
            <SheetContent
              key={batch.id}
              side="right"
              className="min-w-[800px] max-w-2xl overflow-y-auto"
            >
              <BatchDetailsSheet batch={batch} />
            </SheetContent>
          </Sheet>
        ))}
        <AddNewBatchDialog
          trigger={
            <DialogTrigger asChild>
              <Button variant="outline" className="border-dashed h-full w-full">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </Button>
            </DialogTrigger>
          }
        />
      </div>
    </div>
  );
}
