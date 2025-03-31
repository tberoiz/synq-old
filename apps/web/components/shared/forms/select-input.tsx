"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synq/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";

interface SelectOption {
  id: string;
  name: string;
}

interface SelectInputProps {
  control: Control<any>;
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function SelectInput({
  control,
  name,
  label,
  options,
  placeholder = "Select option",
  disabled = false,
  icon,
}: SelectInputProps) {
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
          <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 
