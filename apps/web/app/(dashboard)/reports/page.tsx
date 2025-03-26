"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@synq/ui/input";
import { PageContainer } from "@ui/shared/layouts/server/page-container";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { DownloadPLReportButton } from "@ui/modules/reports/components/DownloadPLReportButton";
import { Button } from "@synq/ui/button";
import { Plus, TrashIcon, CalendarIcon, Loader2, Download, FileSpreadsheet, FileText, FileType } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@synq/ui/dialog";
import { Label } from "@synq/ui/label";
import { useToast } from "@synq/ui/use-toast";
import { saveUserReport, fetchUserReports, deleteUserReport } from "@ui/modules/reports/actions/user-reports";
import { Calendar } from "@synq/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@synq/ui/popover";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@synq/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@synq/ui/dropdown-menu";
import type { Report, ReportType } from "@synq/supabase/types";

const ITEMS_PER_PAGE = 10;

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "pl", label: "Profit & Loss" },
];

// Add export format type
type ExportFormat = "pdf" | "csv" | "excel";

// Add export format options
const EXPORT_FORMATS: { value: ExportFormat; label: string; icon: React.ReactNode }[] = [
  { value: "pdf", label: "PDF", icon: <FileType className="h-4 w-4" /> },
  { value: "csv", label: "CSV", icon: <FileText className="h-4 w-4" /> },
  { value: "excel", label: "Excel", icon: <FileSpreadsheet className="h-4 w-4" /> },
];

export default function ReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportType, setReportType] = useState<ReportType>("pl");
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const { toast } = useToast();

  // Format dates consistently for both input value and display
  const formatDateForDisplay = (date: Date) => format(date, "MM/dd/yyyy");

  // Intersection Observer setup for infinite scrolling
  const lastReportRef = useCallback((node: HTMLTableRowElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, isLoadingMore]);

  // Fetch reports with pagination
  const fetchReports = useCallback(async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const result = await fetchUserReports(pageNum, ITEMS_PER_PAGE);
      
      if (result.success && result.data) {
        if (pageNum === 1) {
          setReports(result.data);
        } else {
          setReports(prev => [...prev, ...result.data]);
        }
        setHasMore(result.data.length === ITEMS_PER_PAGE);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load reports",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [toast]);

  // Initial load and page change effect
  useEffect(() => {
    fetchReports(page);
  }, [page, fetchReports]);

  // Handle report creation
  const handleCreateReport = async () => {
    try {
      // Validate input
      if (!reportName || !date?.from || !date?.to) {
        toast({
          title: "Error",
          description: "Report name and date range are required",
          variant: "destructive",
        });
        return;
      }

      const result = await saveUserReport({
        name: reportName,
        description: reportDescription || undefined,
        type: reportType,
        startDate: date.from.toISOString(),
        endDate: date.to.toISOString(),
        parameters: {
          dateRange: {
            startDate: date.from.toISOString(),
            endDate: date.to.toISOString(),
          },
        },
      });
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Report saved successfully",
        });
        
        // Reset pagination and refresh the reports list
        setPage(1);
        fetchReports(1);
        
        // Reset form
        setReportName("");
        setReportDescription("");
        setReportType("pl");
        setIsCreateDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save report",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save report",
        variant: "destructive",
      });
    }
  };

  // Handle report deletion
  const handleDeleteReport = async (reportId: string) => {
    try {
      const result = await deleteUserReport(reportId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Report deleted successfully",
        });
        
        // Update the reports list
        setReports(prev => prev.filter(report => report.id !== reportId));
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete report",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  // Add export handler function
  const handleExport = async (report: Report, format: ExportFormat) => {
    try {
      if (!report.parameters.dateRange) {
        toast({
          title: "Error",
          description: "Report has no date range",
          variant: "destructive",
        });
        return;
      }

      // Show loading state
      toast({
        title: "Exporting Report",
        description: `Preparing ${format.toUpperCase()} export...`,
      });

      // Call the export API
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: report.id,
          format,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to export report");
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "") || `report-${format}`
        : `report-${format}`;

      // Create a blob from the response
      const blob = await response.blob();

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      toast({
        title: "Success",
        description: `Report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export report",
        variant: "destructive",
      });
    }
  };

  const reportActions = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[300px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Report
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Create a new report with the specified date range.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Report Name</Label>
              <Input 
                id="name" 
                value={reportName} 
                onChange={(e) => setReportName(e.target.value)} 
                placeholder="e.g., Q1 Financial Report" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Report Type</Label>
              <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input 
                id="description" 
                value={reportDescription} 
                onChange={(e) => setReportDescription(e.target.value)} 
                placeholder="Brief description of this report" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReport} disabled={!reportName}>
              Save Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <PageContainer>
      {reportActions}
      <div className="p-6 border rounded-lg shadow-sm mt-4">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
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
              {isLoading && page === 1 ? (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-sm text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading reports...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-sm text-gray-700">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report, index) => (
                  <tr 
                    key={report.id} 
                    className="border-b"
                    ref={index === reports.length - 1 ? lastReportRef : undefined}
                  >
                    <td className="p-3 text-sm ">{report.name}</td>
                    <td className="p-3 text-sm ">
                      {report.parameters.dateRange ? (
                        <>
                          {formatDateForDisplay(new Date(report.parameters.dateRange.startDate))} -{" "}
                          {formatDateForDisplay(new Date(report.parameters.dateRange.endDate))}
                        </>
                      ) : (
                        "No date range"
                      )}
                    </td>
                    <td className="p-3 text-sm ">
                      {REPORT_TYPES.find(t => t.value === report.type)?.label || report.type.toUpperCase()}
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        {report.type === "pl" && report.parameters.dateRange && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {EXPORT_FORMATS.map((format) => (
                                <DropdownMenuItem
                                  key={format.value}
                                  onClick={() => handleExport(report, format.value)}
                                >
                                  {format.icon}
                                  <span className="ml-2">{format.label}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <TrashIcon className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {isLoadingMore && (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading more reports...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
