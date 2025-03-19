"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreVertical } from "lucide-react";
import { Button } from "@synq/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@synq/ui/dropdown-menu";
import { cn } from "@synq/ui/utils";
import { DataTable } from "@ui/shared/components/data-table/data-table";

interface SalesDataTableProps {
  data: Sale[];
}

interface Sale {
  id: string;
  reportName: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  type: string;
  status: "completed" | "pending" | "failed";
}

const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: "reportName",
    header: "Report Name",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.reportName}</div>;
    },
  },
  {
    accessorKey: "dateRange",
    header: "Date Range",
    cell: ({ row }) => {
      const { startDate, endDate } = row.original.dateRange;
      return (
        <div>
          {format(startDate, "MM/dd/yyyy")} - {format(endDate, "MM/dd/yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return <div>{row.original.type}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            row.original.status === "completed" &&
              "bg-green-100 text-green-800",
            row.original.status === "pending" &&
              "bg-yellow-100 text-yellow-800",
            row.original.status === "failed" && "bg-red-100 text-red-800",
          )}
        >
          {row.original.status.charAt(0).toUpperCase() +
            row.original.status.slice(1)}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({  }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Download</DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function SalesDataTable({ data }: SalesDataTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search reports..."
    />
  );
}
