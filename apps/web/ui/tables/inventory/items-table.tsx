"use client";

import { UserItem } from "@synq/supabase/models/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import { Skeleton } from "@synq/ui/skeleton";
import { Checkbox } from "@synq/ui/checkbox";
import { ItemRowSettingsButton } from "@ui/buttons/items-row-settings-button";
import { Sheet, SheetTrigger, SheetContent } from "@synq/ui/sheet";
import ItemDetailsSheetContent from "@ui/sheets/inventory/item-details-sheet";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@synq/supabase/queries/inventory";
import Image from "next/image";

interface ItemsTableProps {
  data: UserItem[];
  loading?: boolean;
  selectedItems?: UserItem[];
  onRowSelectionChange?: (rows: UserItem[]) => void;
}

export function ItemsTable({
  data,
  loading,
  selectedItems = [],
  onRowSelectionChange,
}: ItemsTableProps) {
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["user_inv_categories"],
    queryFn: fetchCategories,
  });

  const handleSelectItem = (itemId: string) => {
    const newSelectedItems = selectedItems.some((i) => i.id === itemId)
      ? selectedItems.filter((i) => i.id !== itemId)
      : [...selectedItems, data.find((item) => item.id === itemId)!];
    if (onRowSelectionChange) {
      onRowSelectionChange(newSelectedItems);
    }
  };

  if (loading || isCategoriesLoading) {
    return (
      <div className="border overflow-x-auto lg:max-h-[800px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Select</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>COGS</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Images</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <span>Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border overflow-x-auto lg:max-h-[500px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Select</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>COGS</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Profit</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Images</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => {
              const profit =
                (Number(item.listing_price) - Number(item.cogs)) *
                Number(item.quantity);
              const isSelected = selectedItems.some((i) => i.id === item.id);
              const categoryName =
                categories?.find((category) => category.id === item.category_id)
                  ?.name || "Uncategorized";

              return (
                <Sheet key={item.id}>
                  <SheetTrigger asChild>
                    <TableRow
                      key={item.id}
                      className="cursor-pointer bg-secondary/50 hover:bg-primary/10"
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectItem(item.id);
                          }}
                          aria-label="Select item"
                        />
                      </TableCell>
                      <TableCell>{item.name || "Unnamed Item"}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(item.cogs)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(item.listing_price)}
                      </TableCell>
                      <TableCell
                        className={
                          profit >= 0 ? "text-green-500" : "text-red-500"
                        }
                      >
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(profit)}
                      </TableCell>
                      <TableCell>{categoryName}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {item.image_urls?.slice(0, 3).map((url, index) => (
                            <div key={index} className="w-10 h-10 relative">
                              <Image
                                src={url}
                                alt={`Item Image ${index + 1}`}
                                fill
                                className="rounded-md object-cover"
                              />
                            </div>
                          ))}
                          {item.image_urls?.length > 3 && (
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                              +{item.image_urls.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ItemRowSettingsButton itemId={item.id} />
                      </TableCell>
                    </TableRow>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full max-w-2xl overflow-y-auto"
                  >
                    <ItemDetailsSheetContent item={item} />
                  </SheetContent>
                </Sheet>
              );
            })
          ) : (
            <TableRow className="bg-secondary/50 hover:bg-primary/10">
              <TableCell colSpan={10} className="text-center">
                No items found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
