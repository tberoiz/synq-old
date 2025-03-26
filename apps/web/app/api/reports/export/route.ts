import { NextResponse } from "next/server";
import { createClient } from "@synq/supabase/server";
import { getUserId, getPLReportData } from "@synq/supabase/queries";
import { generatePLReportPDF } from "../../../ui/modules/reports/utils/pl-report";
import { format } from "date-fns";
import * as XLSX from "xlsx";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { reportId, format: exportFormat } = await request.json();

    if (!reportId || !exportFormat) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get report data
    const { data: report, error: reportError } = await supabase
      .from("user_reports")
      .select("*")
      .eq("id", reportId)
      .eq("user_id", userId)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Get date range from report parameters
    const startDate = new Date(report.parameters.dateRange.startDate);
    const endDate = new Date(report.parameters.dateRange.endDate);

    // Get report data directly from the database query
    const reportData = await getPLReportData(startDate, endDate);

    // Generate filename
    const filename = `${report.name.toLowerCase().replace(/\s+/g, "-")}-${format(
      startDate,
      "yyyy-MM-dd"
    )}-to-${format(endDate, "yyyy-MM-dd")}`;

    switch (exportFormat) {
      case "pdf":
        // Use existing PDF generation
        const pdfBuffer = await generatePLReportPDF(reportData);
        return new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}.pdf"`,
          },
        });

      case "csv":
        const csvContent = generateCSV(reportData);
        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${filename}.csv"`,
          },
        });

      case "excel":
        const excelBuffer = await generateExcel(reportData);
        return new NextResponse(excelBuffer, {
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
          },
        });

      default:
        return NextResponse.json(
          { error: "Unsupported format" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export report" },
      { status: 500 }
    );
  }
}

function generateCSV(data: any) {
  // Convert report data to CSV format
  const rows = [];
  
  // Add header row
  rows.push(["Category", "Amount"]);
  
  // Add revenue data
  rows.push(["Revenue", ""]);
  rows.push(["Total Sales", data.revenue.totalSales]);
  Object.entries(data.revenue.byPlatform).forEach(([platform, amount]) => {
    rows.push([`${platform} Sales`, amount]);
  });
  
  // Add expenses data
  rows.push(["", ""]);
  rows.push(["Expenses", ""]);
  rows.push(["Shipping Costs", data.expenses.shippingCosts]);
  rows.push(["Platform Fees", data.expenses.platformFees]);
  rows.push(["Taxes", data.expenses.taxes]);
  rows.push(["Other Costs", data.expenses.otherCosts]);
  
  // Add profitability data
  rows.push(["", ""]);
  rows.push(["Profitability", ""]);
  rows.push(["Gross Profit", data.profitability.grossProfit]);
  rows.push(["Net Profit", data.profitability.netProfit]);
  rows.push(["Profit Margin", `${data.profitability.profitMargin}%`]);
  
  // Convert to CSV string
  return rows.map(row => row.join(",")).join("\n");
}

async function generateExcel(data: any) {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create revenue sheet
  const revenueData = [
    ["Category", "Amount"],
    ["Revenue", ""],
    ["Total Sales", data.revenue.totalSales],
    ...Object.entries(data.revenue.byPlatform).map(([platform, amount]) => [
      `${platform} Sales`,
      amount,
    ]),
  ];
  const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
  XLSX.utils.book_append_sheet(wb, revenueSheet, "Revenue");
  
  // Create expenses sheet
  const expensesData = [
    ["Category", "Amount"],
    ["Expenses", ""],
    ["Shipping Costs", data.expenses.shippingCosts],
    ["Platform Fees", data.expenses.platformFees],
    ["Taxes", data.expenses.taxes],
    ["Other Costs", data.expenses.otherCosts],
  ];
  const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
  XLSX.utils.book_append_sheet(wb, expensesSheet, "Expenses");
  
  // Create profitability sheet
  const profitabilityData = [
    ["Category", "Amount"],
    ["Profitability", ""],
    ["Gross Profit", data.profitability.grossProfit],
    ["Net Profit", data.profitability.netProfit],
    ["Profit Margin", `${data.profitability.profitMargin}%`],
  ];
  const profitabilitySheet = XLSX.utils.aoa_to_sheet(profitabilityData);
  XLSX.utils.book_append_sheet(wb, profitabilitySheet, "Profitability");
  
  // Generate Excel file
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
} 