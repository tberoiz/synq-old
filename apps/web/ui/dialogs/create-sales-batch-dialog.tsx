"use client";

import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@synq/ui/dialog";
import { Button } from "@synq/ui/button";
import { Plus } from "lucide-react";
import { UserInventory } from "@synq/supabase/models/inventory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";
import { Input } from "@synq/ui/input";

interface NewSalesBatchDialogProps {
  trigger?: ReactNode;
  selectedItems: UserInventory[];
  onCreateBatch: (batchData: any) => void;
}

export const NewSalesBatchDialog = ({
  trigger,
  selectedItems,
  onCreateBatch,
}: NewSalesBatchDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("ebay");
  const [templates, setTemplates] = useState<Record<string, string>>({});

  const handleTemplateChange = (itemId: string, value: string) => {
    setTemplates((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = () => {
    const itemsWithTemplate = selectedItems.map((item) => ({
      ...item,
      template: templates[item.id] || null,
    }));
    onCreateBatch({
      name,
      description,
      platform,
      items: itemsWithTemplate,
    });
  };

  return (
    <Dialog>
      {trigger || (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-sm">
            <Plus className="h-3 w-3 mr-1" />
            Create a new Sales Batch
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create a New Sales Batch
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Batch Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Batch Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter batch name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Platform
            </label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ebay">eBay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selected Items Preview */}
          <div className="mt-6">
            <h3 className="text-lg font-medium">Selected Items</h3>
            <div className="space-y-4">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{item.custom_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Listing Price: ${item.listing_price}
                    </p>
                  </div>
                  <Select
                    value={templates[item.id] || ""}
                    onValueChange={(value) =>
                      handleTemplateChange(item.id, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="template1">Template 1</SelectItem>
                      <SelectItem value="template2">Template 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} className="w-full">
            Create Batch
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
