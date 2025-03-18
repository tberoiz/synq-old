import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@synq/supabase/client";
import { fetchCategories } from "@synq/supabase/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";
import type { InventoryGroup } from "@synq/supabase/types";

interface CategoryFilterProps {
  onCategoryChange: (categoryId: string | null) => void;
}

export function CategoryFilter({ onCategoryChange }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const supabase = createClient();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(supabase),
  });

  useEffect(() => {
    onCategoryChange(selectedCategory);
  }, [selectedCategory, onCategoryChange]);

  return (
    <Select
      value={selectedCategory ?? "all"}
      onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories?.map((category: InventoryGroup) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
