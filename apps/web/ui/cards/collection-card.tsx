import { Card, CardContent, CardTitle } from "@synq/ui/card";
import { Checkbox } from "@synq/ui/checkbox";
import { cn } from "@synq/ui/utils";
import { CollectionsRowSettingsButton } from "@ui/dialogs/collections-row-settings-button";

interface CollectionCardProps {
  id: string;
  name: string;
  itemCount: number;
  totalValue: number;
  totalProfit: number;
  isActive?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onSelect?: (e: React.MouseEvent) => void;
}

export function CollectionCard({
  id,
  name,
  itemCount,
  totalValue,
  totalProfit,
  isActive = false,
  isSelected = false,
  onClick,
  onSelect,
}: CollectionCardProps) {
  return (
    <Card
      className={cn(
        "relative hover:shadow-md transition-shadow group cursor-pointer",
        isActive ? "border-primary shadow-lg" : "border-muted",
        isSelected && "bg-secondary/50 border-2 border-primary/50",
      )}
      onClick={onClick}
    >
      {/* Collection Settings Button */}
      <div className="absolute top-1 right-1">
        <CollectionsRowSettingsButton collectionId={id} />
      </div>

      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Collection Name with Checkbox */}
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
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalValue)}
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
