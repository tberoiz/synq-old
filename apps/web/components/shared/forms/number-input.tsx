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
  step?: number;
  min?: number;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function NumberInput({
  control,
  name,
  label,
  disabled = false,
  step = 0.01,
  min,
  placeholder,
  icon,
}: NumberInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-1">
            {icon}
            {label}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type="number"
              step={step}
              min={min}
              disabled={disabled}
              placeholder={placeholder}
              value={field.value || ""}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === "" ? 0 : parseFloat(value));
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 
