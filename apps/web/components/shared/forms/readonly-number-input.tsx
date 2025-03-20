"use client";

import {
  FormControl,
  FormItem,
  FormLabel,
} from "@synq/ui/form";
import { Input } from "@synq/ui/input";

interface ReadOnlyNumberInputProps {
  label: string;
  value: number;
}

export function ReadOnlyNumberInput({
  label,
  value,
}: ReadOnlyNumberInputProps) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input 
          value={value} 
          disabled 
          type="number" 
          className="bg-muted"
        />
      </FormControl>
    </FormItem>
  );
} 
