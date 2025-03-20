"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synq/ui/form";
import { Input } from "@synq/ui/input";

interface NumberInputProps {
  control: Control<any>;
  name: string;
  label: string;
  disabled?: boolean;
  step?: string;
}

export function NumberInput({
  control,
  name,
  label,
  disabled = false,
  step = "0.01",
}: NumberInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="number"
              step={step}
              disabled={disabled}
              onChange={(e) => field.onChange(parseFloat(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 
