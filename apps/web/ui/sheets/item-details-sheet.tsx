import { Button } from "@synq/ui/button";
import { JSX } from "react";
import { SheetHeader, SheetTitle, SheetFooter } from "@synq/ui/sheet";
import { Tag } from "lucide-react";
import { TCGPlayerIcon, EbayIcon } from "@ui/icons/icons";
import { format } from "date-fns";

const platformIcons: { [key in "tcgplayer" | "ebay"]: JSX.Element } = {
  tcgplayer: <TCGPlayerIcon className="w-4 h-4" />,
  ebay: <EbayIcon className="w-4 h-4" />,
};

export default function ItemDetailsSheetContent() {
  const fakeData = {
    name: "Black Lotus",
    stock: 5,
    sku: "BL-ALPHA-001",
    platforms: ["tcgplayer", "ebay"],
    lastSold: new Date("2023-10-15"),
    marketPrices: {
      tcgplayer: 25000,
      ebay: 25500,
    },
  };

  const { name, stock, sku, platforms, lastSold, marketPrices } = fakeData;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Tag className="h-6 w-6" />
          <div>
            <div>{name}</div>
            <div className="text-sm text-muted-foreground">SKU: {sku}</div>
          </div>
        </SheetTitle>
      </SheetHeader>

      <div className="grid gap-4 py-4">
        <div className="text-sm">
          <div className="flex justify-between">
            <span>Stock:</span>
            <span>{stock}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Sold:</span>
            <span>{format(lastSold, "MMM dd, yyyy")}</span>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Market Prices</h3>
          <div className="text-sm">
            <div className="flex justify-between">
              <span>TCGplayer:</span>
              <span>${marketPrices.tcgplayer.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>eBay:</span>
              <span>${marketPrices.ebay.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Platforms</h3>
          <div className="space-y-2">
            {platforms.map((platform) => (
              <div key={platform} className="flex items-center gap-2">
                {/* {platformIcons[platform]} */}
                <span className="text-sm">{platform}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SheetFooter className="flex-row gap-2 justify-end grow">
        <Button type="submit">Update Listings</Button>
      </SheetFooter>
    </>
  );
}
