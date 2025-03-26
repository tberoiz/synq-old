"use client";

import { format } from "date-fns";
import { Badge } from "@synq/ui/badge";
import type { TransformedPurchaseBatch } from "@synq/supabase/types";
import { Package, Calendar, DollarSign, Box, TrendingUp } from "lucide-react";

interface PurchaseBatchCardProps {
  batch: TransformedPurchaseBatch;
}

export function PurchaseBatchCard({ batch }: PurchaseBatchCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
      <div className="flex-1 min-w-0 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 max-w-full">
            <Package className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <h4 className="text-sm font-medium truncate">{batch.name}</h4>
          </div>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            <Calendar className="h-3 w-3 mr-1" />
            <time dateTime={batch.created_at}>
              {format(new Date(batch.created_at), "MMM dd, yyyy")}
            </time>
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1 flex-shrink-0">
            <DollarSign className="h-3 w-3 flex-shrink-0" />
            <span>{batch.unit_cost.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Box className="h-3 w-3 flex-shrink-0" />
            <span>{batch.quantity} units</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <TrendingUp className="h-3 w-3 flex-shrink-0" />
            <span className="font-medium">${(batch.unit_cost * batch.quantity).toFixed(2)} total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
