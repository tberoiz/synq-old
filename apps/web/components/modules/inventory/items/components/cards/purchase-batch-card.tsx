"use client";

import { format } from "date-fns";
import { Badge } from "@synq/ui/badge";
import type { TransformedPurchaseBatch } from "@synq/supabase/types";

interface PurchaseBatchCardProps {
  batch: TransformedPurchaseBatch;
}

export function PurchaseBatchCard({ batch }: PurchaseBatchCardProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium truncate">{batch.name}</h4>
          <Badge variant="outline" className="text-xs">
            <time dateTime={batch.created_at}>
              {format(new Date(batch.created_at), "MMM dd, yyyy")}
            </time>
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span>${batch.unit_cost}</span>
          <span>•</span>
          <span>{batch.quantity} units</span>
          <span>•</span>
          <span>${(batch.unit_cost * batch.quantity).toFixed(2)} total</span>
        </div>
      </div>
    </div>
  );
}
