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

interface TextInputProps {
  control: Control<any>;
  name: string;
  label: string;
  disabled?: boolean;
  placeholder?: string;
}

export function TextInput({
  control,
  name,
  label,
  disabled = false,
  placeholder,
}: TextInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} disabled={disabled} placeholder={placeholder} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 
