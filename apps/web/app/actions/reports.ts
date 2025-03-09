"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { createClient } from "@synq/supabase/server";
import { getUserId } from "@synq/supabase/queries";
import type { ActionResponse, PDFReportData } from "@synq/supabase/types";
import { generatePLPDF } from "@ui/features/reports/components/PLGenerator";

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
      const supabase = await createClient();
      const userId = await getUserId();

      if (!userId) {
        return {
          success: false,
          error: {
            code: "AUTH_ERROR",
            message: "Please log in to generate reports.",
          },
        };
      }

      // Get sales data
      const { data: salesData, error: salesError } = await supabase
        .from("vw_sales_ui_table")
        .select(
          `
          total_revenue,
          platform,
          shipping_cost,
          tax_amount,
          platform_fees,
          total_cogs
        `,
        )
        .eq("user_id", userId)
        .gte("sale_date", parsedInput.startDate.toISOString())
        .lte("sale_date", parsedInput.endDate.toISOString());

      if (salesError) {
        return {
          success: false,
          error: {
            code: "SALES_DATA_ERROR",
            message: "Failed to fetch sales data.",
          },
        };
      }

      // Calculate revenue by platform
      const revenueByPlatform = salesData.reduce(
        (acc, sale) => {
          acc[sale.platform] =
            (acc[sale.platform] || 0) + (sale.total_revenue || 0);
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalRevenue = Object.values(revenueByPlatform).reduce(
        (sum, amount) => sum + amount,
        0,
      );

      // Calculate expenses
      const totalShippingCosts = salesData.reduce(
        (sum, sale) => sum + (sale.shipping_cost || 0),
        0,
      );
      const totalPlatformFees = salesData.reduce(
        (sum, sale) => sum + (sale.platform_fees || 0),
        0,
      );
      const totalTaxes = salesData.reduce(
        (sum, sale) => sum + (sale.tax_amount || 0),
        0,
      );
      const totalCOGS = salesData.reduce(
        (sum, sale) => sum + (sale.total_cogs || 0),
        0,
      );

      // Calculate profitability
      const grossProfit = totalRevenue - totalCOGS;
      const netProfit =
        grossProfit - totalShippingCosts - totalPlatformFees - totalTaxes;
      const profitMargin =
        totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Generate PDF
      const pdfBuffer = await generatePLPDF({
        dateRange: {
          startDate: parsedInput.startDate,
          endDate: parsedInput.endDate,
        },
        data: {
          revenue: {
            totalSales: totalRevenue,
            byPlatform: revenueByPlatform,
          },
          expenses: {
            shippingCosts: totalShippingCosts,
            platformFees: totalPlatformFees,
            taxes: totalTaxes,
            otherCosts: totalCOGS,
          },
          profitability: {
            grossProfit,
            netProfit,
            profitMargin,
          },
        },
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
