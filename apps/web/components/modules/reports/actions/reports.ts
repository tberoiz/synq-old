"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { getPLReportData } from "@synq/supabase/queries";
import type { ActionResponse, PDFReportData } from "@synq/supabase/types";
import { generatePLPDF } from "@ui/modules/reports/components/PLGenerator";

const action = createSafeActionClient();

// Time period schema for filtering reports
const timePeriodSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

// Generate P&L Report
export const generatePLReport = action
  .schema(timePeriodSchema)
  .action(async ({ parsedInput }): Promise<ActionResponse<PDFReportData>> => {
    try {
      const reportData = await getPLReportData(
        parsedInput.startDate,
        parsedInput.endDate
      );

      // Generate PDF
      const pdfBuffer = await generatePLPDF({
        dateRange: {
          startDate: parsedInput.startDate,
          endDate: parsedInput.endDate,
        },
        data: reportData,
      });

      return {
        success: true,
        data: {
          pdf: pdfBuffer.toString("base64"),
          filename: `pl-report-${parsedInput.startDate.toISOString().split("T")[0]}-${parsedInput.endDate.toISOString().split("T")[0]}.pdf`,
        },
      };
    } catch (error) {
      console.error("Error generating P&L report:", error);
      return {
        success: false,
        error: {
          code: "PL_REPORT_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate P&L report",
        },
      };
    }
  });
