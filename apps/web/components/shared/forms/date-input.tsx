import { Control } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synq/ui/form";
import { Button } from "@synq/ui/button";
import { Calendar } from "@synq/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@synq/ui/popover";
import { cn } from "@synq/ui/utils";

interface DateInputProps {
  control: Control<any>;
  name: string;
  label: string;
  disabled?: (date: Date) => boolean;
  icon?: React.ReactNode;
}

export function DateInput({ control, name, label, disabled, icon }: DateInputProps) {
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
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={disabled}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
