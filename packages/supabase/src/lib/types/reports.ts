import type { Database } from "./database.types";

// User Report types
export type UserReport = Database["public"]["Tables"]["user_reports"]["Row"];
export type UserReportInsert = Database["public"]["Tables"]["user_reports"]["Insert"];
export type UserReportUpdate = Database["public"]["Tables"]["user_reports"]["Update"];

// Report types enum
export type ReportType = "pl" | "inventory" | "sales" | "custom";

// Report parameters interface
export interface ReportParameters {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
  options?: Record<string, any>;
  [key: string]: any;
}

// Frontend Report interface
export interface Report {
  id: string;
  name: string;
  description: string | null;
  type: ReportType;
  user_id: string;
  created_at: string;
  parameters: ReportParameters;
}

// Report data response interface
export interface ReportResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    type: ReportType;
    dateRange: {
      startDate: Date;
      endDate: Date;
    };
    createdAt: Date;
  };
  error?: {
    code: string;
    message: string;
  };
}

// List of user reports response
export interface UserReportsListResponse {
  success: boolean;
  data?: {
    reports: Array<{
      id: string;
      name: string;
      description?: string;
      type: ReportType;
      dateRange: {
        startDate: Date;
        endDate: Date;
      };
      createdAt: Date;
    }>;
  };
  error?: {
    code: string;
    message: string;
  };
}

// P&L Report Data types
export interface PLReportData {
  revenue: {
    totalSales: number;
    byPlatform: Record<string, number>;
  };
  expenses: {
    shippingCosts: number;
    platformFees: number;
    taxes: number;
    otherCosts: number;
  };
  profitability: {
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
  };
}

export interface PLReportResponse {
  success: boolean;
  data?: {
    pdf: string;
    filename: string;
  };
  error?: {
    code: string;
    message: string;
  };
} 