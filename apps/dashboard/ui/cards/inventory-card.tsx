import { Card, CardContent } from "@repo/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/tooltip";

import {
  FolderKanban,
  Tags,
  GalleryVerticalEnd,
  Grip,
} from "lucide-react";

import Link from "next/link";
import { memo } from "react";

function InventoryCard({
  name,
  items,
  stock,
}: {
  name: string;
  items: number;
  stock: number;
}) {
  // TODO: Add more fields such as related active listing, total sales, etc.
  const inventoryCardFields = [
    { icon: Tags, tooltip: "Total items", value: items },
    { icon: GalleryVerticalEnd, tooltip: "Total stock", value: stock },
  ];

  return (
    <Link href={`/inventory/${name}`}>
      <Card className="cursor-pointer hover:shadow-md" draggable>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <FolderKanban />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              <div className="flex gap-2">
                {inventoryCardFields.map((field) => (
                  <TooltipProvider key={field.tooltip}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm text-muted-foreground flex items-center cursor-pointer">
                          <field.icon
                            size={14}
                            className="inline-flex mr-1 items-center"
                          />
                          {field.value}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{field.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
            <Grip size={14} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
export default memo(InventoryCard)
