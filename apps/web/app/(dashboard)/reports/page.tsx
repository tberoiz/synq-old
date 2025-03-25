"use client";

import { useState } from "react";
import { Input } from "@synq/ui/input";
import { PageContainer } from "@ui/shared/layouts/server/page-container";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { DownloadPLReportButton } from "@ui/modules/reports/components/DownloadPLReportButton";

export default function PnLReportsPage() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  // Format dates consistently for both input value and display
  const formatDateForInput = (date: Date) => format(date, "yyyy-MM-dd");
  const formatDateForDisplay = (date: Date) => format(date, "MM/dd/yyyy");

  const reportActions = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={formatDateForInput(startDate)}
          onChange={(e) => setStartDate(new Date(e.target.value))}
          className="w-[140px]"
        />
        <span className="text-muted-foreground">to</span>
        <Input
          type="date"
          value={formatDateForInput(endDate)}
          onChange={(e) => setEndDate(new Date(e.target.value))}
          className="w-[140px]"
        />
      </div>
      <DownloadPLReportButton startDate={startDate} endDate={endDate} />
    </div>
  );

  return (
    <PageContainer>
      {reportActions}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Report Name
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Date Range
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Type
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Example Row */}
              <tr className="border-b">
                <td className="p-3 text-sm text-gray-700">Current Month P&L</td>
                <td className="p-3 text-sm text-gray-700">
                  {formatDateForDisplay(startDate)} -{" "}
                  {formatDateForDisplay(endDate)}
                </td>
                <td className="p-3 text-sm text-gray-700">P&L Statement</td>
                <td className="p-3 text-sm text-gray-700">
                  <DownloadPLReportButton
                    startDate={startDate}
                    endDate={endDate}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
