import { Card, CardContent, CardTitle } from "@synq/ui/card";
import { Progress } from "@synq/ui/progress";
import { cn } from "@synq/ui/utils";
import { ItemRowSettingsButton } from "@ui/dialogs/items-row-settings-button";

import { List } from "lucide-react";

interface ItemCardProps {
  id: string;
  name: string;
  quantity: number;
  cogs: number;
  listingPrice: number;
  onClick?: () => void;
}

export function ItemCard({
  id,
  name,
  quantity,
  cogs,
  listingPrice,
  onClick,
}: ItemCardProps) {
  const profit = listingPrice - cogs;

  return (
    <Card
      className={cn(
        "relative hover:shadow-md transition-shadow group cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Inventory Settings Button */}
      <div className="absolute top-1 right-1">
        <ItemRowSettingsButton itemId={id} />
      </div>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Item Name */}
            <div className="flex items-center gap-2 mb-2">
              <List className="h-4 w-4 text-primary" strokeWidth={1} />
              <CardTitle className="text-sm">{name}</CardTitle>
            </div>

            {/* Quantity */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <Progress
                value={(quantity / 100) * 100}
                className="h-1.5 bg-primary/20"
              />
            </div>

            {/* Financial Information */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">COGS</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(cogs)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listing Price</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(listingPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profit</span>
                <span
                  className={cn(
                    "font-medium",
                    profit >= 0 ? "text-green-500" : "text-red-500"
                  )}
                >
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(profit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
