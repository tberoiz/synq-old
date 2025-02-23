"use client";

import { useState } from "react";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { Label } from "@synq/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";

export const SalesBatchForm = ({ onSave }: { onSave: (data: any) => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("ebay");

  const handleSubmit = () => {
    onSave({
      name,
      description,
      platform,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Batch Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter batch name"
        />
      </div>
      <div>
        <Label>Description (Optional)</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
        />
      </div>
      <div>
        <Label>Platform</Label>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ebay">eBay</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSubmit}>Create Batch</Button>
    </div>
  );
};
