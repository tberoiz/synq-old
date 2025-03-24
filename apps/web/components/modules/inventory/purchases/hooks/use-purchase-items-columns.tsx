// React core imports
import { useMemo, useState, useEffect, useRef, memo } from "react";

// Third-party library imports
import { type ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

// Types
import { PurchaseItemWithDetails } from "@synq/supabase/types";

// Components
import { Input } from "@synq/ui/input";
import { Button } from "@synq/ui/button";
import { Badge } from "@synq/ui/badge";

// Add numeric validation constants
const MAX_NUMERIC_VALUE = 99999999.99; // For numeric(10,2) columns
const DECIMAL_PLACES = 2;

interface UsePurchasesColumnsProps {
  onRemoveItem: (id: string) => void;
  updates: Map<string, { quantity: number; unit_cost: number }>;
  onQuantityChange: (id: string, value: number) => void;
  onUnitCostChange: (id: string, value: number) => void;
}

interface QuantityCellProps {
  id: string;
  initialQuantity: number;
  onQuantityChange: (id: string, value: number) => void;
}

const QuantityCell = memo(
  ({ id, initialQuantity, onQuantityChange }: QuantityCellProps) => {
    const [localValue, setLocalValue] = useState(initialQuantity);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setLocalValue(initialQuantity);
    }, [initialQuantity]);

    const handleBlur = () => {
      const clampedValue = Math.min(Math.max(localValue, 1), 2147483647); // Postgres integer max
      if (clampedValue !== localValue) {
        setLocalValue(clampedValue);
      }
      if (clampedValue !== initialQuantity) {
        onQuantityChange(id, clampedValue);
      }
    };

    return (
      <div onClick={(e) => e.stopPropagation()}>
        <Input
          ref={inputRef}
          type="number"
          min="1"
          max="2147483647" // Postgres integer max
          className="h-8"
          value={localValue}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            inputRef.current?.focus();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              e.preventDefault();
              inputRef.current?.blur();
            }
          }}
          onChange={(e) => {
            const value =
              e.target.value === "" ? 1 : parseInt(e.target.value, 10);
            setLocalValue(value);
          }}
          onBlur={handleBlur}
        />
      </div>
    );
  }
);

interface UnitCostCellProps {
  id: string;
  initialUnitCost: number;
  onUnitCostChange: (id: string, value: number) => void;
}

const UnitCostCell = memo(
  ({ id, initialUnitCost, onUnitCostChange }: UnitCostCellProps) => {
    const [localValue, setLocalValue] = useState(initialUnitCost);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setLocalValue(initialUnitCost);
    }, [initialUnitCost]);

    const sanitizeValue = (value: number) => {
      // Round to 2 decimal places and clamp within allowed range
      const rounded = Number(value.toFixed(DECIMAL_PLACES));
      return Math.min(Math.max(rounded, 0), MAX_NUMERIC_VALUE);
    };

    const handleBlur = () => {
      const sanitized = sanitizeValue(localValue);
      if (sanitized !== localValue) {
        setLocalValue(sanitized);
      }
      if (sanitized !== initialUnitCost) {
        onUnitCostChange(id, sanitized);
      }
    };

    return (
      <Input
        ref={inputRef}
        type="number"
        min="0"
        max={MAX_NUMERIC_VALUE}
        step="0.01"
        className="h-8"
        value={localValue}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          inputRef.current?.focus();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            e.preventDefault();
            inputRef.current?.blur();
          }
        }}
        onChange={(e) => {
          const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
          setLocalValue(value);
        }}
        onBlur={handleBlur}
      />
    );
  }
);

export function usePurchaseItemsColumns({
  onRemoveItem,
  updates,
  onQuantityChange,
  onUnitCostChange,
}: UsePurchasesColumnsProps) {
  return useMemo(
    () =>
      [
        {
          accessorKey: "name",
          header: "Item",
          cell: ({ row }) => (
            <div className="space-y-1">
              <div className="text-lg font-medium flex items-center gap-2">
                <p className="truncate">{row.original.name}</p>
                {row.original.is_archived && (
                  <Badge variant="outline" className="text-xs">
                    archived
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                sku: {row?.original?.sku || "-"}
              </div>
            </div>
          ),
        },
        {
          accessorKey: "quantity",
          header: "Quantity",
          cell: ({ row }) => {
            const update = updates.get(row.original.id);
            const quantity = update?.quantity ?? row.original.quantity;

            return (
              <QuantityCell
                id={row.original.id}
                initialQuantity={quantity}
                onQuantityChange={onQuantityChange}
              />
            );
          },
        },
        {
          accessorKey: "unit_cost",
          header: "Unit Cost",
          cell: ({ row }) => {
            const update = updates.get(row.original.id);
            const unitCost = update?.unit_cost ?? row.original.unit_cost;

            return (
              <UnitCostCell
                id={row.original.id}
                initialUnitCost={unitCost}
                onUnitCostChange={onUnitCostChange}
              />
            );
          },
        },
        {
          id: "actions",
          header: "",
          cell: ({ row }) => (
            <div className="text-right">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveItem(row.original.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ),
        },
      ] as ColumnDef<PurchaseItemWithDetails>[],
    [updates, onRemoveItem, onQuantityChange, onUnitCostChange]
  );
}
