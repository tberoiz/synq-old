"use client";

import { useState } from "react";
import { generatePLReport } from "@ui/modules/reports/actions/reports";
import { Download } from "lucide-react";
import type {
  PDFReportData,
  ActionResponse,
  ActionError,
} from "@synq/supabase/types";
import { Button } from "@synq/ui/button";
import { useToast } from "@synq/ui/use-toast";
import type { SafeActionResult } from "next-safe-action";

interface DownloadPLReportButtonProps {
  startDate: Date;
  endDate: Date;
}

function base64ToBytes(base64: string): Uint8Array {
  try {
    // Remove any whitespace from the base64 string
    const cleanBase64 = base64.replace(/\s/g, "");
    // Convert base64 to binary string
    const binaryString = atob(cleanBase64);
    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    console.error("Error converting base64 to bytes:", error);
    throw new Error("Failed to decode PDF data");
  }
}

export function DownloadPLReportButton({
  startDate,
  endDate,
}: DownloadPLReportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      setIsLoading(true);

      const result = await generatePLReport({
        startDate,
        endDate,
      });

      console.log("Server response:", {
        result,
        hasData: result && "data" in result,
        isError: result && "error" in result,
      });

      if (!result || typeof result !== "object") {
        throw new Error("Invalid response from server");
      }

      // Check for error response
      if (
        "error" in result &&
        result.error &&
        typeof result.error === "object"
      ) {
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
        // Handle nested response structure
        const response = result.data as {
          success: boolean;
          data: PDFReportData;
        };

        if (!response.success || !response.data) {
          throw new Error("Invalid response format");
        }

        const pdfData = response.data;
        console.log("PDF data:", {
          hasPdf: Boolean(pdfData.pdf),
          pdfLength: pdfData.pdf?.length,
          filename: pdfData.filename,
        });

        if (!pdfData.pdf) {
          throw new Error("No PDF data received");
        }

        // Convert base64 to binary
        const bytes = base64ToBytes(pdfData.pdf);
        console.log("Converted to bytes:", {
          bytesLength: bytes.length,
          isUint8Array: bytes instanceof Uint8Array,
        });

        // Create blob and download
        const pdfBlob = new Blob([bytes], { type: "application/pdf" });
        console.log("Created blob:", {
          blobSize: pdfBlob.size,
          blobType: pdfBlob.type,
        });

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
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error downloading P&L report:", error);
      toast({
        title: "Download Failed",
        description:
          error instanceof Error ? error.message : "Failed to download report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? (
        "Generating..."
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download P&L Report
        </>
      )}
    </Button>
  );
}
