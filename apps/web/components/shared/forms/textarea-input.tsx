"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synq/ui/form";
import { Textarea } from "@synq/ui/textarea";

interface TextareaInputProps {
  control: Control<any>;
  name: string;
  label: string;
  disabled?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function TextareaInput({
  control,
  name,
  label,
  disabled = false,
  placeholder,
  icon,
  className,
}: TextareaInputProps) {
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
            <Textarea
              {...field}
              disabled={disabled}
              placeholder={placeholder}
              className={className}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 