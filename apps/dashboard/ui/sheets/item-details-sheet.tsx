import { Button } from "@synq/ui/button";
import { JSX } from "react";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@synq/ui/sheet";
import { format } from "date-fns";
import { Pencil, Tag } from "lucide-react";
import { TCGPlayerIcon, EbayIcon, ShopifyIcon } from "@ui/icons/icons";
import { formatDistanceToNow as formatDistance } from "date-fns";

const platformIcons: {
  [key in "tcgplayer" | "ebay" | "shopify"]: JSX.Element;
} = {
  tcgplayer: <TCGPlayerIcon className="w-4 h-4" />,
  ebay: <EbayIcon className="w-4 h-4" />,
  shopify: <ShopifyIcon className="w-4 h-4" />,
};

export default function ItemDetailsSheetContent({
  name = "",
  stock = 0,
  sku = "",
  platforms= ["tcgplayer"],
  lastSold,
  lastSynced,
}: {
  name?: string;
  stock?: number;
  sku?: string;
  platforms?: ("tcgplayer" | "ebay" | "shopify")[];
  lastSold?: Date;
  lastSynced?: Date;
}) {
  function formatDistanceToNow(lastSynced: Date): import("react").ReactNode {
    return formatDistance(lastSynced, { addSuffix: true });
  }
  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Tag className="h-6 w-6" />
          {name}
        </SheetTitle>
        <SheetDescription>
          {sku && `SKU: ${sku} • `}
          Last synced: {lastSynced ? formatDistanceToNow(lastSynced) : "Never"}
        </SheetDescription>
      </SheetHeader>

      <div className="grid gap-6 py-6">
        {/* Stock Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Inventory Distribution</h3>
            <div className="space-y-2">
              {platforms?.map((platform) => (
                <div key={platform} className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {platformIcons[platform]}
                    {platform}
                  </span>
                  <span>{(stock / platforms.length).toFixed(0)} units</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sales History */}
          <div>
            <h3 className="font-medium mb-2">Sales History</h3>
            <div className="text-sm space-y-1">
              <p>Last sold: {lastSold ? format(lastSold, "PP") : "Never"}</p>
              <p>7-day sales: 24 units</p>
              <p>30-day average: 3.4 units/day</p>
            </div>
          </div>
        </div>

        {/* Pricing History Chart */}
        <div>
          <h3 className="font-medium mb-4">Price History</h3>
          <div className="h-32 bg-muted rounded-lg p-4">
            {/* Replace with actual chart component */}
            <div className="text-center text-muted-foreground text-sm">
              Price chart placeholder
            </div>
          </div>
        </div>

        {/* Listing Management */}
        <div>
          <h3 className="font-medium mb-4">Active Listings</h3>
          <div className="space-y-2">
            {platforms?.map((platform) => (
              <div
                key={platform}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {platformIcons[platform]}
                  <span className="text-sm">{platform}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">$12.99</span>
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SheetFooter className="flex-row gap-2 justify-end grow">
        <Button variant="outline">Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </SheetFooter>
    </>
  );
}
