// TODO: Needs refactoring

import { Card, CardContent, CardTitle } from "@synq/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@synq/ui/tooltip";
import { cn } from "@synq/ui/utils";
import { Package } from "lucide-react";
import {
  CardMarketIcon,
  EbayIcon,
  ShopifyIcon,
  TCGPlayerIcon,
} from "@ui/icons/icons";
import { Progress } from "@synq/ui/progress";
import { Inventory } from "@synq/supabase/models";
import { InventorySettingsButton } from "@ui/buttons/inventory-settings-button";

interface InventoryCardProps extends Pick<Inventory, 'id' | 'name'> {
  stock?: number;
  channel?: ("tcgplayer" | "ebay" | "shopify" | "cardmarket")[];
  isActive?: boolean;
  onClick?: () => void;
}

function InventoryCard({
  id,
  name,
  stock = 100,
  channel = ['shopify'],
  isActive = false,
  onClick,
}: InventoryCardProps) {
  const isLowStock = stock && stock <= 10;

  // Platform icons mapping
  const platformIcons = {
    tcgplayer: <TCGPlayerIcon className="w-3 h-3" />,
    ebay: <EbayIcon className="w-3 h-3" />,
    shopify: <ShopifyIcon className="w-3 h-3" />,
    cardmarket: <CardMarketIcon className="w-3 h-3" />,
  };

  return (
    <Card
      className={cn(
        "relative hover:shadow-md transition-shadow group cursor-pointer",
        isActive ? "border-primary shadow-lg" : "border-muted"
      )}
      onClick={onClick}
    >
      {/* Inventory Settings Button */}
      <div className="absolute top-1 right-1">
        <InventorySettingsButton inventoryId={id} />
      </div>

      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Inventory Name */}
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-primary" strokeWidth={1} />
              <CardTitle className="text-sm">{name}</CardTitle>
              {channel?.length > 0 && (
                <div className="flex gap-1">
                  {channel.map((platform) => (
                    <Tooltip key={platform}>
                      <TooltipTrigger>
                        <div className="p-1 bg-muted rounded-md">
                          {platformIcons[platform]}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        Selling in {platform}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>

            {/* Stock Information */}
            <div className="space-y-1 mb-3 mt-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Stock</span>
                <span
                  className={cn(
                    "font-medium",
                    isLowStock ? "text-red-600" : "text-muted-foreground"
                  )}
                >
                  {`${stock} remaining`}
                </span>
              </div>
              {/* Progress Bar */}
              <Progress
                value={stock === undefined ? 100 : (stock / 100) * 100}
                className={cn(
                  "h-1.5",
                  isLowStock ? "bg-red-200" : "bg-primary/20"
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default InventoryCard;
