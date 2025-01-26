import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@repo/ui/sheet";
import { memo } from "react";
import { GalleryVerticalEnd, EllipsisVertical, Tag, Grip } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/tooltip";
import ItemDetailsForm from "@ui/forms/item-details-form";
import { Separator } from "@repo/ui/separator";
import { Button } from "@repo/ui/button";

function ItemCard({
  name,
  stock,
}: {
  name: string;
  stock: number | undefined;
}) {
  // TODO: Add more fields such as related active listing, total sales, etc.
  const itemCardFields = [
    { icon: GalleryVerticalEnd, tooltip: "Total stock", value: stock },
  ];
  return (
    <Sheet>
      <SheetTrigger asChild draggable>
        <div className="rounded-md border p-4 cursor-pointer hover:shadow-md">
          <div className="flex items-center space-x-4">
            <Tag strokeWidth={1} />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none text-left">
                {name}
              </p>
              <div className="flex gap-2">
                {itemCardFields.map((field) => (
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
        </div>
      </SheetTrigger>
      <SheetContent side={"right"}>
        <SheetHeader>
          <SheetTitle>Item Name</SheetTitle>
          <SheetDescription>
            View and edit detailed information about this item. Update the
            stock, manage related listings, and track performance metrics.
          </SheetDescription>
          <Separator />
        </SheetHeader>
        <ItemDetailsForm />
        <Separator />
        <SheetFooter className="mt-4">
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default memo(ItemCard);
