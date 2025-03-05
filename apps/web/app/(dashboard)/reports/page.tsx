// TODO: This is a mockup page
// - backend needs to be created
// - ui components has to be created
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synq/ui/select";
import { Download, FileText, Calendar, PieChart } from "lucide-react";

export default function PnLReportsPage() {
  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Automated P&L Reports</h2>
        <Button variant="default" size="sm">
          <Download className="mr-2 h-4 w-4" /> Export All Reports
        </Button>
      </div>

      {/* Key Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* One-Click Reports Card */}
        <div className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-600">One-Click Reports</p>
          </div>
          <p className="text-gray-600">
            Simplify tax season with one-click P&L statements.
          </p>
        </div>

        {/* Date Range Reports Card */}
        <div className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-purple-600" />
            <p className="text-sm text-purple-600">Custom Date Range</p>
          </div>
          <p className="text-gray-600">
            Generate P&L statements for any date range in Excel.
          </p>
        </div>

        {/* 1099-Ready Reports Card */}
        <div className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-600">1099-Ready Reports</p>
          </div>
          <p className="text-gray-600">
            Export 1099-ready reports for your accountant.
          </p>
        </div>

        {/* Track Income & Expenses Card */}
        <div className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-orange-600" />
            <p className="text-sm text-orange-600">Track Finances</p>
          </div>
          <p className="text-gray-600">
            Track income, expenses, and profits effortlessly.
          </p>
        </div>
      </div>

      {/* Report Generator Section */}
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Generate P&L Report</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Date Range Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Date Range
            </label>
            <Input
              type="date"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Report Type Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Report Type
            </label>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a report" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pnl-statement">P&amp;L Statement</SelectItem>
                <SelectItem value="1099-report">1099 Report</SelectItem>
                <SelectItem value="income-summary">Income Summary</SelectItem>
                <SelectItem value="expense-summary">Expense Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Report Button */}
          <div className="flex items-end">
            <Button className="w-full">
              <FileText className="mr-2 h-4 w-4" /> Generate Report
            </Button>
          </div>

          {/* Export Report Button */}
          <div className="flex items-end">
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
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
                <td className="p-3 text-sm text-gray-700">Q1 2023 P&L</td>
                <td className="p-3 text-sm text-gray-700">
                  Jan 1, 2023 - Mar 31, 2023
                </td>
                <td className="p-3 text-sm text-gray-700">P&L Statement</td>
                <td className="p-3 text-sm text-gray-700">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
