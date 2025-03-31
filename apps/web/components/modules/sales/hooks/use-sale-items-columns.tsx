// REACT
import { useMemo, memo, useState, useEffect, useRef } from "react";

// TYPES
import { Sale, CreateSaleInput, SaleItemWithDetails } from "@synq/supabase/types";
import { ColumnDef } from "@tanstack/react-table";

// UI COMPONENTS
import { Input } from "@synq/ui/input";
import { Boxes, Hash, DollarSign } from "lucide-react";

type SaleItem = Sale["items"][0];
type CreateSaleItem = CreateSaleInput["items"][0];

export type SaleItemType = SaleItem | CreateSaleItem | SaleItemWithDetails;

interface UseSalesColumnProps {
  onUpdateItem?: (itemId: string, updates: { quantity?: number; price?: number }) => void;
  isEditable?: boolean;
  localChanges?: Record<string, { quantity?: number; price?: number }>;
}

interface InputComponentProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  initialValue: number;
  onUpdate: (id: string, value: number) => void;
}

const useDebouncedInput = (initial: number, delay: number) => {
  const [input, setInput] = useState(initial.toString());
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { input, setInput, timerRef };
};

interface BaseInputProps extends InputComponentProps {
  format: (value: number) => string;
  parse: (value: string) => number;
  validate?: (value: number) => boolean;
  errorClass: string;
}

const BaseInput = memo(({ 
  id,
  initialValue,
  onUpdate,
  format,
  parse,
  validate,
  errorClass,
  ...props
}: BaseInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { input, setInput, timerRef } = useDebouncedInput(initialValue, 500);
  const [error, setError] = useState(false);

  const handleBlur = () => {
    const parsed = parse(input);
    const validValue = validate?.(parsed) ? parsed : initialValue;
    setInput(format(validValue));
    onUpdate(id, validValue);
  };

  return (
    <Input
      ref={inputRef}
      value={input}
      onChange={(e) => {
        const val = e.target.value;
        setInput(val);
        timerRef.current = setTimeout(() => {
          const parsed = parse(val);
          if (validate?.(parsed)) onUpdate(id, parsed);
        }, 500);
      }}
      onBlur={handleBlur}
      className={error ? errorClass : ''}
      {...props}
    />
  );
});

const QuantityInput = memo(({ id, initialValue, maxValue, onUpdate }: InputComponentProps & { maxValue: number }) => (
  <div className="flex flex-col items-center space-y-1">
    <BaseInput
      id={id}
      initialValue={initialValue}
      onUpdate={onUpdate}
      format={(v) => v.toString()}
      parse={(v) => Math.max(0, parseInt(v) || 0)}
      validate={(v) => v <= maxValue}
      errorClass="border-red-500 focus-visible:ring-red-500"
      type="text"
      inputMode="numeric"
      className="h-8 w-20 text-center"
    />
    <div className="text-xs text-muted-foreground">
      {initialValue > maxValue 
        ? <span className="text-red-500">Max: {maxValue}</span>
        : <span>Available: {maxValue}</span>}
    </div>
  </div>
));

const PriceInput = memo(({ id, initialValue, onUpdate }: InputComponentProps) => (
  <div className="relative w-20">
    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
    <BaseInput
      id={id}
      initialValue={initialValue}
      onUpdate={onUpdate}
      format={(v) => v.toFixed(2)}
      parse={(v) => parseFloat(v.replace(/[^\d.]/g, '')) || 0}
      className="pl-6 h-8 w-20 text-right"
      type="text"
      inputMode="decimal"
      errorClass="border-red-500 focus-visible:ring-red-500"
    />
  </div>
));

const PriceCell = memo(({ price }: { price: number }) => (
  <div className="h-8 w-20 flex items-center justify-center rounded-md border border-input bg-background px-3 py-2">
    ${price.toFixed(2)}
  </div>
));

const useItemData = (item: SaleItemType, localChanges: Record<string, any>) => {
  const itemId = "id" in item ? item.id : "purchaseItemId" in item ? item.purchaseItemId : "";
  const isPurchaseItem = "purchase_item" in item;

  return {
    itemId,
    isPurchaseItem,
    quantity: localChanges[itemId]?.quantity ?? (
      isPurchaseItem ? item.sold_quantity : "quantity" in item ? item.quantity : 0
    ),
    price: localChanges[itemId]?.price ?? (
      isPurchaseItem ? item.sale_price : "unit_price" in item ? item.unit_price : 0
    ),
    maxQuantity: isPurchaseItem ? item.purchase_item.remaining_quantity : 0,
    unitCost: isPurchaseItem ? item.purchase_item.unit_cost : 0
  };
};

export function useSaleItemsColumns({
  onUpdateItem,
  isEditable,
  localChanges = {},
}: UseSalesColumnProps = {}): ColumnDef<SaleItemType>[] {
  const commonHeader = (icon: React.ReactNode, text: string) => (
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span>{text}</span>
    </div>
  );

  return useMemo(() => [
    {
      accessorKey: "name",
      header: () => commonHeader(<Boxes className="h-4 w-4" />, "Item"),
      cell: ({ row }) => {
        const name = "purchase_item" in row.original 
          ? row.original.purchase_item.item.item_name 
          : "name" in row.original 
            ? row.original.name 
            : "";
        return <div className="flex items-center gap-2 min-h-[42px] py-1">{name}</div>;
      },
    },
    {
      accessorKey: "sku",
      header: () => commonHeader(<Hash className="h-4 w-4" />, "SKU"),
      cell: ({ row }) => {
        const sku = "purchase_item" in row.original 
          ? row.original.purchase_item.item.sku 
          : "sku" in row.original 
            ? row.original.sku 
            : "";
        return <div className="flex items-center gap-2 min-h-[42px] py-1">{sku}</div>;
      },
    },
    {
      accessorKey: "quantity",
      header: () => commonHeader(null, "Quantity"),
      cell: ({ row }) => {
        const { itemId, quantity, maxQuantity } = useItemData(row.original, localChanges);
        
        return isEditable && onUpdateItem ? (
          <div className="flex justify-center p-2 min-w-[120px]">
            <QuantityInput
              id={itemId}
              initialValue={quantity}
              maxValue={maxQuantity}
              onUpdate={(id, value) => onUpdateItem(id, { quantity: value })}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-2 min-w-[120px]">
            <div className="h-8 w-20 flex items-center justify-center rounded-md border border-input bg-background px-3 py-2">
              {quantity}
            </div>
            <span className="text-xs text-muted-foreground">Available: {maxQuantity}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "unit_price",
      header: () => commonHeader(null, "Unit Price"),
      cell: ({ row }) => {
        const { itemId, price } = useItemData(row.original, localChanges);
        
        return isEditable && onUpdateItem ? (
          <div className="flex justify-center p-2 min-w-[100px]">
            <PriceInput
              id={itemId}
              initialValue={price}
              onUpdate={(id, value) => onUpdateItem(id, { price: value })}
            />
          </div>
        ) : <PriceCell price={price} />;
      },
    },
    {
      accessorKey: "total_price",
      header: () => commonHeader(<DollarSign className="h-4 w-4" />, "Total Price"),
      cell: ({ row }) => {
        const { quantity, price } = useItemData(row.original, localChanges);
        return <PriceCell price={quantity * price} />;
      },
    },
    {
      accessorKey: "total_cost",
      header: () => commonHeader(<DollarSign className="h-4 w-4" />, "COGS"),
      cell: ({ row }) => {
        const { quantity, unitCost } = useItemData(row.original, localChanges);
        return <PriceCell price={quantity * unitCost} />;
      },
    },
    {
      accessorKey: "profit",
      header: () => commonHeader(<DollarSign className="h-4 w-4" />, "Profit"),
      cell: ({ row }) => {
        const { quantity, price, unitCost } = useItemData(row.original, localChanges);
        return <PriceCell price={quantity * (price - unitCost)} />;
      },
    },
  ], [onUpdateItem, isEditable, localChanges]);
}
