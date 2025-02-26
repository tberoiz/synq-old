"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { SheetHeader, SheetTitle, SheetFooter } from "@synq/ui/sheet";
import { Tag, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@synq/ui/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { UserItem } from "@synq/supabase/models/inventory";
import {
  updateItem,
  fetchCategories,
  uploadImages,
  deleteItemImage,
} from "@synq/supabase/queries/inventory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";
import Image from "next/image";

const itemSchema = z.object({
  name: z.string().min(2, { message: "Item name must be at least 2 characters." }),
  sku: z.string().min(1, { message: "SKU is required." }),
  quantity: z.number().min(0, { message: "Quantity must be at least 0." }),
  cogs: z.number().min(0, { message: "COGS must be at least 0." }),
  listingPrice: z.number().min(0, { message: "Listing price must be at least 0." }),
  categoryId: z.string().min(1, { message: "Category is required." }),
});

export default function ItemDetailsSheetContent({ item }: { item: UserItem | null; }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>(item?.image_urls || []);
  useEffect(() => {
    setImages(item?.image_urls || []);
  }, [item]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["user_inv_categories"],
    queryFn: fetchCategories,
  });
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: item?.name || "",
      sku: item?.sku || "",
      quantity: item?.quantity || 0,
      cogs: item?.cogs || 0,
      listingPrice: item?.listing_price || 0,
      categoryId: item?.category_id || "",
    },
  });
  const onSubmit = useCallback(async (data: any) => {
    if (!item) return;
    try {
      await updateItem(item.id, {
        name: data.name,
        sku: data.sku,
        quantity: data.quantity,
        cogs: data.cogs,
        listingPrice: data.listingPrice,
        categoryId: data.categoryId,
      });
      queryClient.invalidateQueries({ queryKey: ["user_inventory_items"] });
      toast({ title: "Success", description: "Item updated successfully!", variant: "default" });
    } catch (error) {
      console.error("Error updating item:", error);
      toast({ title: "Error", description: "Failed to update item. Please try again.", variant: "destructive" });
    }
  }, [item, queryClient, toast]);
  const handleImageUpload = useCallback(async (files: File[]) => {
    if (!item) return;
    try {
      const newImageUrls = await uploadImages(item.id, files);
      setImages((prev) => [...prev, ...newImageUrls]);
      toast({ title: "Success", description: "Images uploaded successfully!", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ["user_inventory_items"] });
      queryClient.invalidateQueries({ queryKey: ["user_inv_items"] });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({ title: "Error", description: "Failed to upload images. Please try again.", variant: "destructive" });
    }
  }, [item, queryClient, toast]);
  const handleDeleteImage = useCallback(async (imageIndex: number) => {
    if (!item) return;
    const imageUrl = images[imageIndex];
    if (!imageUrl) return;
    try {
      await deleteItemImage(item.id, imageUrl);
      setImages((prev) => prev.filter((_, idx) => idx !== imageIndex));
      toast({ title: "Success", description: "Image deleted successfully!", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ["user_inventory_items"] });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete image. Please try again.", variant: "destructive" });
    }
  }, [item, images, queryClient, toast]);
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(Array.from(files));
    }
  }, [handleImageUpload]);
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const imageGrid = useMemo(() => (
    <div className="grid grid-cols-2 gap-2 p-4">
      {images.map((image, index) => (
        <div key={index} className="aspect-square overflow-hidden rounded-lg relative group">
          <Image src={image} alt={`Item Image ${index + 1}`} fill className="object-cover" />
          <Button size="icon" className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteImage(index)}>
            <Trash2 className="h-4 w-4 text-white" />
          </Button>
        </div>
      ))}
      <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400" onClick={openFileDialog}>
        <Plus className="h-6 w-6 text-gray-400" />
      </div>
    </div>
  ), [images, handleDeleteImage, openFileDialog]);
  if (!item) return <div className="p-4 text-center">Item not found</div>;
  return (
    <div className="flex flex-col h-full">
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInputChange} />
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
        {imageGrid}
        <SheetHeader className="p-4">
          <SheetTitle className="flex items-center gap-2">
            <Tag className="h-6 w-6" />
            <div>
              <div className="text-lg font-medium">{item.name}</div>
              <div className="text-sm text-muted-foreground">
                Created: {format(new Date(item.created_at), "MMM dd, yyyy")}
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Item Name</label>
            <Input {...register("name")} placeholder="Item Name" autoComplete="off" className="w-full" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">SKU</label>
            <Input {...register("sku")} placeholder="SKU" autoComplete="off" className="w-full" />
            {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <Input {...register("quantity", { valueAsNumber: true })} type="number" min="0" className="w-full" />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">COGS (Cost)</label>
            <Input {...register("cogs", { valueAsNumber: true })} type="number" step="0.01" min="0" className="w-full" />
            {errors.cogs && <p className="text-red-500 text-xs mt-1">{errors.cogs.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Listing Price</label>
            <Input {...register("listingPrice", { valueAsNumber: true })} type="number" step="0.01" min="0" className="w-full" />
            {errors.listingPrice && <p className="text-red-500 text-xs mt-1">{errors.listingPrice.message}</p>}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select onValueChange={(value) => setValue("categoryId", value)} defaultValue={item.category_id || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {isCategoriesLoading ? (
                  <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                ) : categoriesError ? (
                  <SelectItem value="error" disabled>Failed to load categories.</SelectItem>
                ) : (
                  categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
          </div>
        </div>
        <SheetFooter className="sticky bottom-0 bg-background border-t p-4">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Updating..." : "Update Item"}
          </Button>
        </SheetFooter>
      </form>
    </div>
  );
}
