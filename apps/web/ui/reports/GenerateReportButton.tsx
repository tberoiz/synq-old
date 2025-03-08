"use client";

import { FileText } from "lucide-react";
import { Button } from "@synq/ui/button";
import { useToast } from "@synq/ui/use-toast";
import { cn } from "@synq/ui/utils";
import type { ActionError } from "@synq/supabase/types";
import { generatePLReport } from "../../app/actions/reports";

interface GenerateReportButtonProps {
  startDate: Date;
  endDate: Date;
}

export function GenerateReportButton({
  startDate,
  endDate,
}: GenerateReportButtonProps) {
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    try {
      const result = await generatePLReport({
        startDate,
        endDate,
      });

      if (!result || typeof result !== "object") {
        throw new Error("Invalid response from server");
      }

      // Check for error response
      if ("error" in result && result.error) {
        const error = result.error as ActionError;
        // Handle auth error
        if (error.code === "AUTH_ERROR") {
          toast({
            title: "Authentication Required",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        throw new Error(error.message || "Failed to generate report");
      }

      // Check for success response with data
      if ("data" in result && result.data && typeof result.data === "object") {
        const response = result.data;

        if (!response.success || !response.data) {
          throw new Error("Invalid response format");
        }

        const pdfData = response.data;

        if (!pdfData.pdf) {
          throw new Error("No PDF data received");
        }

        // Convert base64 to binary
        const binaryString = atob(pdfData.pdf);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Create blob and download
        const pdfBlob = new Blob([bytes], { type: "application/pdf" });
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", pdfData.filename || "pl-report.pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Report downloaded successfully",
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Generation Failed",
        description:
          error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      className={cn(
        "h-24 w-full flex flex-col items-center justify-center space-y-2",
        "border-dashed border-2 hover:border-solid",
        "bg-orange-50/50 hover:bg-orange-100/50 border-orange-200",
        "dark:bg-orange-950/20 dark:hover:bg-orange-900/20 dark:border-orange-800",
      )}
      onClick={handleGenerateReport}
    >
      <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
      <span className="text-sm">Generate Report</span>
    </Button>
  );
}
