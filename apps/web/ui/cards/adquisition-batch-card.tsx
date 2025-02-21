import { Card, CardContent, CardTitle } from "@synq/ui/card";
import { cn } from "@synq/ui/utils";
import { Package } from "lucide-react";

interface AcquisitionBatchCardProps {
  id: string;
  name: string;
  itemCount: number;
  totalCogs: number;
  totalListingPrice: number;
  totalProfit: number;
  isActive?: boolean;
  onClick?: () => void;
}

export function AcquisitionBatchCard({
  id,
  name,
  itemCount,
  totalCogs,
  totalListingPrice,
  totalProfit,
  isActive = false,
  onClick,
}: AcquisitionBatchCardProps) {
  return (
    <Card
      className={cn(
        "relative hover:shadow-md transition-shadow group cursor-pointer",
        isActive ? "border-primary shadow-lg" : "border-muted",
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Batch Name */}
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-primary" strokeWidth={1} />
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
