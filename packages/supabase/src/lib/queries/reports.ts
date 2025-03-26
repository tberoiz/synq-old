import { createClient } from "../client/server";
import { getUserId } from "./user";
import type { 
  ReportType, 
  UserReport, 
  UserReportInsert, 
  UserReportUpdate, 
  ReportParameters 
} from "../types";

/**
 * Save a report to the database
 */
export async function saveReport({
  name,
  description,
  type,
  startDate,
  endDate,
  parameters,
}: {
  name: string;
  description?: string;
  type: ReportType;
  startDate: Date;
  endDate: Date;
  parameters?: ReportParameters;
}) {
  const supabase = await createClient();
  const userId = await getUserId();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("user_reports")
    .insert({
      user_id: userId,
      name,
      description,
      type,
      parameters: {
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        ...parameters,
      },
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to save report: ${error.message}`);
  }

  return data;
}

/**
 * Get a list of all reports for the current user
 */
export async function getUserReports({ 
  type,
  limit = 50,
  offset = 0,
}: { 
  type?: ReportType;
  limit?: number;
  offset?: number;
} = {}) {
  const supabase = await createClient();
  const userId = await getUserId();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  let query = supabase
    .from("user_reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }

  return data.map((report) => ({
    ...report,
    parameters: report.parameters as ReportParameters,
  }));
}

/**
 * Get a single report by ID
 */
export async function getReportById(id: string) {
  const supabase = await createClient();
  const userId = await getUserId();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("user_reports")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch report: ${error.message}`);
  }

  return {
    ...data,
    parameters: data.parameters as ReportParameters,
  };
}

/**
 * Update an existing report
 */
export async function updateReport(
  id: string,
  updates: Partial<Omit<UserReportUpdate, "id" | "user_id">>
) {
  const supabase = await createClient();
  const userId = await getUserId();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  // First check if the report exists and belongs to the user
  const { data: existingReport, error: fetchError } = await supabase
    .from("user_reports")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingReport) {
    throw new Error("Report not found or access denied");
  }

  // Process date fields if they exist in parameters
  const processedUpdates = { ...updates };
  
  if (updates.parameters) {
    const params = updates.parameters as any;
    if (params.dateRange) {
      if (params.dateRange.startDate && typeof params.dateRange.startDate !== 'string') {
        params.dateRange.startDate = params.dateRange.startDate.toISOString();
      }
      if (params.dateRange.endDate && typeof params.dateRange.endDate !== 'string') {
        params.dateRange.endDate = params.dateRange.endDate.toISOString();
      }
    }
  }

  const { data, error } = await supabase
    .from("user_reports")
    .update(processedUpdates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update report: ${error.message}`);
  }

  return data;
}

/**
 * Delete a report
 */
export async function deleteReport(id: string) {
  const supabase = await createClient();
  const userId = await getUserId();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("user_reports")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete report: ${error.message}`);
  }

  return true;
}

/**
 * Fetch sales data for P&L report generation
 */
export async function getPLReportData(startDate: Date, endDate: Date) {
  const supabase = await createClient();
  const userId = await getUserId();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const { data: salesData, error } = await supabase
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
    .gte("sale_date", startDate.toISOString())
    .lte("sale_date", endDate.toISOString());

  if (error) {
    throw new Error(`Failed to fetch sales data: ${error.message}`);
  }

  // Calculate revenue by platform
  const revenueByPlatform = salesData.reduce(
    (acc, sale) => {
      acc[sale.platform] = (acc[sale.platform] || 0) + (sale.total_revenue || 0);
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
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
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
  };
} 