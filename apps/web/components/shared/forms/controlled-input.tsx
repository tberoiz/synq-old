"use client";

import { useController } from "react-hook-form";
import { Input } from "@synq/ui/input";
import { memo, useEffect, useRef } from "react";
import { cn } from "@synq/ui/utils";
import { useDebouncedCallback } from "use-debounce";

interface ControlledInputProps {
  name: string;
  control: any;
  type?: string;
  min?: number;
  step?: string;
  className?: string;
  currency?: boolean;
  onBlur?: () => void;
}

export const ControlledInput = memo(({ 
  name,
  control,
  type = "text",
  min,
  step,
  className,
  currency,
  onBlur,
  ...props
}: ControlledInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { field } = useController({ name, control });
  const debouncedUpdate = useDebouncedCallback(field.onChange, 500);

  useEffect(() => {
    if (type === "number" && inputRef.current) {
      inputRef.current.value = field.value.toString();
    }
  }, [field.value, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (type === "number") {
      value = value.replace(/[^0-9.]/g, '');
      if (currency) {
        const decimalCount = (value.split('.')[1] || []).length;
        if (decimalCount > 2) {
          value = parseFloat(value).toFixed(2);
        }
      }
    }

    field.onChange(value);
    debouncedUpdate(value);
  };

  return (
    <Input
      {...field}
      {...props}
      ref={inputRef}
      type={type}
      min={min}
      step={step}
      onChange={handleChange}
      onBlur={onBlur}
      className={cn(
        "focus-visible:ring-0 focus-visible:ring-offset-0",
        currency ? "pl-6" : "",
        className
      )}
    />
  );
}, (prevProps, nextProps) => 
  prevProps.name === nextProps.name &&
  prevProps.control === nextProps.control
);