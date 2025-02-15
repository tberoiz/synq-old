import { Button } from "@synq/ui/button";
import { Progress } from "@synq/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@synq/ui/sheet";
import { cn } from "@synq/ui/utils";
import { TCGPlayerIcon, EbayIcon, ShopifyIcon } from "@ui/icons/icons";
import ItemDetailsSheetContent from "@ui/sheets/item-details-sheet";
import { Pencil, Tag, Zap } from "lucide-react";

export default function ItemCard({
  name,
  stock,
  sku,
  platforms,
  lowStockThreshold = 5,
  lastSold,
  listingsCount,
  lastSynced,
}: {
  name: string;
  stock: number;
  sku?: string;
  platforms?: ("tcgplayer" | "ebay" | "shopify")[];
  lowStockThreshold?: number;
  lastSold?: Date;
  listingsCount?: number;
  lastSynced?: Date;
}) {
  const isLowStock = stock <= lowStockThreshold;
  const platformIcons = {
    tcgplayer: <TCGPlayerIcon className="w-4 h-4" />,
    ebay: <EbayIcon className="w-4 h-4" />,
    shopify: <ShopifyIcon className="w-4 h-4" />,
  };

  return (
    <Sheet>
      <div className="relative rounded-md border p-4 hover:shadow-md group">
        {/* Low Stock Badge */}
        {isLowStock && (
          <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            Low Stock
          </span>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Item Header */}
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" strokeWidth={1} />
              <div>
                <h3 className="font-medium">{name}</h3>
                {sku && <p className="text-xs text-muted-foreground">{sku}</p>}
              </div>
            </div>

            {/* Platform Listings */}
            {platforms && (
              <div className="flex gap-1.5 items-center">
                {platforms.map((platform) => platformIcons[platform])}
                <span className="text-xs text-muted-foreground">
                  {listingsCount} listings
                </span>
              </div>
            )}

            {/* Stock Info */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available</span>
                <span
                  className={cn(
                    "font-medium",
                    isLowStock ? "text-red-600" : "text-foreground",
                  )}
                >
                  {stock} units
                </span>
              </div>
              <Progress
                value={(stock / (stock + 10)) * 100} // Example calculation
                className="h-2"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-8">
                <Zap className="h-4 w-4 mr-2" strokeWidth={1} />
                Relate
              </Button>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                  <Pencil className="h-4 w-4 mr-2" strokeWidth={1} />
                  Edit
                </Button>
              </SheetTrigger>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details Sheet */}
      <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto">
        <ItemDetailsSheetContent
          name={name}
          stock={stock}
          sku={sku}
          platforms={platforms}
          lastSold={lastSold}
          lastSynced={lastSynced}
        />
      </SheetContent>
    </Sheet>
  );
}
