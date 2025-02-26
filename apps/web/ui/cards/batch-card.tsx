"use client";

import { Card, CardContent, CardTitle } from "@synq/ui/card";
import { cn } from "@synq/ui/utils";
import { BatchRowSettingsButton } from "@ui/buttons/batch-row-settings-button";
import { Checkbox } from "@synq/ui/checkbox";

interface BatchCardProps {
  id: string;
  name: string;
  itemCount: number;
  totalCogs: number;
  totalListingPrice: number;
  totalProfit: number;
  isActive?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onSelect?: (e: React.MouseEvent) => void;
}

export function AcquisitionBatchCard({
  id,
  name,
  itemCount,
  totalCogs,
  totalListingPrice,
  totalProfit,
  isActive = false,
  isSelected = false,
  onClick,
  onSelect,
}: BatchCardProps) {
  return (
    <Card
      className={cn(
        "relative hover:shadow-md transition-shadow group cursor-pointer bg-secondary/25 hover:primary/50",
        isActive ? "border-primary shadow-lg" : "border-muted",
        isSelected && "bg-secondary/50 border-2 border-primary/50",
      )}
      onClick={onClick}
    >
      {/* Inventory Settings Button */}
      <div className="absolute top-1 right-1">
        <BatchRowSettingsButton batchId={id} />
      </div>

      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Batch Name with Checkbox */}
            <div
              className="flex items-center gap-2 mb-2"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(e);
              }}
            >
              <Checkbox
                checked={isSelected}
                aria-label={`Select ${name}`}
                className="h-4 w-4"
              />
              <CardTitle className="text-sm">{name}</CardTitle>
            </div>

            {/* Item Count */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Items</span>
                <span>{itemCount} items</span>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total COGS</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalCogs)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total Listing Price
                </span>
                <span className="font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalListingPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Profit</span>
                <span
                  className={cn(
                    "font-medium",
                    totalProfit >= 0 ? "text-green-500" : "text-red-500",
                  )}
                >
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
