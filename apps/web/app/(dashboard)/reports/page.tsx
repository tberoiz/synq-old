"use client";

import { useState } from "react";
import { Input } from "@synq/ui/input";
import { PageContainer } from "@/ui/layouts/server/page-container";
import { PageHeader } from "@/ui/layouts/server/page-header";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { DownloadPLReportButton } from "@ui/features/reports/components/DownloadPLReportButton";

export default function PnLReportsPage() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  // Format dates consistently for both input value and display
  const formatDateForInput = (date: Date) => format(date, "yyyy-MM-dd");
  const formatDateForDisplay = (date: Date) => format(date, "MM/dd/yyyy");

  return (
    <PageContainer>
      <PageHeader title="Automated P&L Reports" />

      {/* Report Generator Section */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Generate P&L Report</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Start Date
            </label>
            <Input
              type="date"
              value={formatDateForInput(startDate)}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              End Date
            </label>
            <Input
              type="date"
              value={formatDateForInput(endDate)}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Download Button */}
          <div className="flex items-end">
            <DownloadPLReportButton startDate={startDate} endDate={endDate} />
          </div>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
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
