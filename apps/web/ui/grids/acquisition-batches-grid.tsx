"use client";

import { UserAcquisitionBatch } from "@synq/supabase/models/inventory";
import { AcquisitionBatchCard } from "@ui/cards/adquisition-batch-card";
import { Button } from "@synq/ui/button";

interface AcquisitionBatchesGridProps {
  batches: UserAcquisitionBatch[];
  selectedBatch: UserAcquisitionBatch | null;
  currentPage: number;
  totalPages: number;
  onBatchClick: (batch: UserAcquisitionBatch) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export function AcquisitionBatchesGrid({
  batches,
  selectedBatch,
  currentPage,
  totalPages,
  onBatchClick,
  onNextPage,
  onPreviousPage,
}: AcquisitionBatchesGridProps) {
  return (
    <div className="w-full">
      {/* Grid Layout */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {batches.map((batch) => (
          <AcquisitionBatchCard
            key={batch.id}
            id={batch.id}
            name={batch.name}
            itemCount={batch.item_count}
            totalCogs={batch.total_cogs}
            totalListingPrice={batch.total_listing_price}
            totalProfit={batch.total_profit}
            isActive={selectedBatch?.id === batch.id}
            onClick={() => onBatchClick(batch)}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage === totalPages - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
