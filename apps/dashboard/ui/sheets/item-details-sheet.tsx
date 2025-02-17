import { Button } from "@synq/ui/button";
import { JSX } from "react";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@synq/ui/sheet";
import { format } from "date-fns";
import { Pencil, Tag, Gem, ShieldAlert, Library, BarChart } from "lucide-react";
import { TCGPlayerIcon, EbayIcon, ShopifyIcon } from "@ui/icons/icons";
import { formatDistanceToNow as formatDistance } from "date-fns";

const platformIcons: {
  [key in "tcgplayer" | "ebay" | "shopify"]: JSX.Element;
} = {
  tcgplayer: <TCGPlayerIcon className="w-4 h-4" />,
  ebay: <EbayIcon className="w-4 h-4" />,
  shopify: <ShopifyIcon className="w-4 h-4" />,
};

export default function ItemDetailsSheetContent() {
  // Fake data for demonstration
  const fakeData = {
    name: "Black Lotus",
    set: "Alpha",
    rarity: "Rare",
    condition: "Near Mint",
    graded: true,
    stock: 5,
    sku: "BL-ALPHA-001",
    platforms: ["tcgplayer", "ebay"],
    lastSold: new Date("2023-10-15"),
    lastSynced: new Date("2023-10-20"),
    marketPrices: {
      tcgplayer: 25000,
      ebay: 25500,
      buylist: 23000,
    },
    buylistPrices: {
      tcgplayer: 22000,
      channelFireball: 22500,
    },
  };

  const {
    name,
    set,
    rarity,
    condition,
    graded,
    stock,
    sku,
    platforms,
    lastSold,
    lastSynced,
    marketPrices,
    buylistPrices,
  } = fakeData;

  const conditionColors = {
    "Near Mint": "bg-green-100 text-green-800",
    "Lightly Played": "bg-yellow-100 text-yellow-800",
    "Moderately Played": "bg-orange-100 text-orange-800",
    "Heavily Played": "bg-red-100 text-red-800",
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Tag className="h-6 w-6" />
          <div className="space-y-1">
            <div>{name}</div>
            <div className="text-sm font-normal text-muted-foreground">
              {set} • {rarity}
            </div>
          </div>
        </SheetTitle>
        <SheetDescription>
          <div className="flex items-center gap-4 mt-2">
            <span className={`px-2 py-1 rounded-md text-sm ${conditionColors[condition]}`}>
              {condition}
            </span>
            {graded && (
              <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                <Gem className="h-4 w-4" />
                Graded (PSA 9)
              </span>
            )}
          </div>
        </SheetDescription>
      </SheetHeader>

      <div className="grid gap-6 py-6">
        {/* Market Overview */}
        <div className="grid grid-cols-1s gap-4">
          {/* Pricing Comparison */}
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Market Prices
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>TCGplayer Market:</span>
                <span>${marketPrices.tcgplayer.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>eBay Sold Avg:</span>
                <span>${marketPrices.ebay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Buylist Price:</span>
                <span>${marketPrices.buylist.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Inventory Health */}
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Inventory Health
            </h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Stock Across Platforms:</span>
                <span>{stock}</span>
              </div>
              <div className="flex justify-between">
                <span>7-Day Sales Velocity:</span>
                <span>2 units</span>
              </div>
              <div className="flex justify-between">
                <span>Days of Inventory Left:</span>
                <span>{(stock / 0.3).toFixed(1)} days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Listings */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Library className="h-4 w-4" />
            Platform Listings
          </h3>
          <div className="space-y-2">
            {platforms.map((platform) => (
              <div
                key={platform}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {platformIcons[platform]}
                  <div>
                    <div className="text-sm">{platform}</div>
                    <div className="text-xs text-muted-foreground">
                      {platform === "psa" || platform === "beckett"
                        ? `Grade PSA 9`
                        : `Listed ${formatDistance(new Date())}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {!graded && (
                    <>
                      <span className="text-sm">${marketPrices[platform].toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground">
                        {platform === "tcgplayer" ? "Market" : "Listed"}
                      </span>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price History Chart */}
        <div>
          <h3 className="font-medium mb-4">90-Day Price Trend</h3>
          <div className="h-32 bg-muted rounded-lg p-4">
            {/* Replace with actual time-series chart */}
            <div className="text-center text-muted-foreground text-sm">
              Price chart showing market trends
            </div>
          </div>
        </div>
      </div>

      <SheetFooter className="flex-row gap-2 justify-end grow">
        <Button variant="outline">Sync Platforms</Button>
        <Button type="submit">Update Listings</Button>
      </SheetFooter>
    </>
  );
}
