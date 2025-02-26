"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetContent,
} from "@synq/ui/sheet";
import {
  Package,
  TrendingUp,
  DollarSign,
  Tag,
  User,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@synq/ui/table";
import { Button } from "@synq/ui/button";
import { Badge } from "@synq/ui/badge";
import { Skeleton } from "@synq/ui/skeleton";

interface Listing {
  id: string;
  status: "pending" | "listed" | "failed";
  listId: string;
  platform: string;
  link: string;
}

interface BulkListingBatch {
  id: string;
  name: string;
  description: string;
  totalListings: number;
  successfulListings: number;
  failedListings: number;
  listings: Listing[];
}

interface BulkListingDetailsSheetProps {
  batch: BulkListingBatch;
}

export function BulkListingDetailsSheet({
  batch,
}: BulkListingDetailsSheetProps) {
  const queryClient = useQueryClient();

  // Mock function to simulate retrying failed listings
  const handleRetryFailedListings = async () => {
    // Simulate retry logic
    console.log("Retrying failed listings...");
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation
    queryClient.invalidateQueries({ queryKey: ["bulk_listings", batch.id] });
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <div>
            <div className="text-lg font-medium">{batch.name}</div>
            <SheetDescription className="text-sm text-muted-foreground">
              {batch.description}
            </SheetDescription>
          </div>
        </SheetTitle>
      </SheetHeader>

      {/* Batch Stats */}
      <div className="grid grid-cols-3 gap-4 py-4">
        {/* Total Listings Card */}
        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-600">Total Listings</p>
          </div>
          <p className="text-lg font-semibold text-blue-900">
            {batch.totalListings}
          </p>
        </div>

        {/* Successful Listings Card */}
        <div className="p-4 border rounded-lg bg-green-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-600">Successful Listings</p>
          </div>
          <p className="text-lg font-semibold text-green-900">
            {batch.successfulListings}
          </p>
        </div>

        {/* Failed Listings Card */}
        <div className="p-4 border rounded-lg bg-red-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-600">Failed Listings</p>
          </div>
          <p className="text-lg font-semibold text-red-900">
            {batch.failedListings}
          </p>
        </div>
      </div>

      {/* Listings Table */}
      <div className="py-4">
        <h3 className="text-lg font-semibold mb-4">Listings</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Listing ID</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batch.listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>
                  <Badge
                    variant={
                      listing.status === "listed"
                        ? "default"
                        : listing.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {listing.status}
                  </Badge>
                </TableCell>
                <TableCell>{listing.listId}</TableCell>
                <TableCell>{listing.platform}</TableCell>
                <TableCell>
                  <a
                    href={listing.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Listing
                  </a>
                </TableCell>
                <TableCell>
                  {listing.status === "failed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRetryFailedListings}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Retry All Failed Listings Button */}
      {batch.failedListings > 0 && (
        <div className="py-4">
          <Button
            onClick={handleRetryFailedListings}
            className="w-full flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry All Failed Listings
          </Button>
        </div>
      )}
    </>
  );
}
