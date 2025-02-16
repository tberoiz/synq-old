import { Card, CardContent } from "@synq/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@synq/ui/tooltip";
import { cn } from "@synq/ui/utils";
import { AlertCircle, Package } from "lucide-react";
import { CardMarketIcon, EbayIcon, ShopifyIcon, TCGPlayerIcon } from "@ui/icons/icons";
import { Progress } from "@synq/ui/progress";

interface InventoryCardProps {
  name: string;
  items: number;
  stock: number;
  channel?: (
    | "tcgplayer"
    | "ebay"
    | "shopify"
    | "cardmarket"
  )[];
  lowStockThreshold?: number;
  lastSynced?: Date;
  isActive?: boolean;
  onClick?: () => void;
}

interface InventoryCardProps {
  name: string;
  items: number;
  stock: number;
  channel?: ("tcgplayer" | "ebay" | "shopify" | "cardmarket")[];
  lowStockThreshold?: number;
  lastSynced?: Date;
  isActive?: boolean;
  onClick?: () => void;
}

function InventoryCard({
  name,
  items,
  stock,
  channel = [],
  lowStockThreshold = 10,
  isActive = false,
  onClick,
}: InventoryCardProps) {
  let isLowStock = null;
  if (stock && stock !== undefined) {
    isLowStock = stock <= lowStockThreshold;
  }

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
      {/* Low Stock Alert */}
      {isLowStock && stock !== undefined && (
        <div className="absolute top-1 right-1">
          <Tooltip>
            <TooltipTrigger>
              <AlertCircle className="h-3 w-3 text-red-500" />
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              Low stock alert! Only {stock} items remaining.
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Inventory Name */}
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-primary" strokeWidth={1} />
              <h3 className="font-light text-sm">{name}</h3>
              {channel.length > 0 && (
                <div className="flex gap-1">
                  {channel.map((platform) => (
                    <Tooltip key={platform}>
                      <TooltipTrigger>
                        <div className="p-1 bg-muted rounded-md">
                          {platformIcons[platform]}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        Synced with {platform}
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
                value={stock === undefined ? 100 : (stock / items) * 100}
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
