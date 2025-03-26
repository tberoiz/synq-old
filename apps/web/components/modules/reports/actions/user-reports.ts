'use server';

import { saveReport, getUserReports, deleteReport } from '@synq/supabase/queries';
import type { ReportType } from '@synq/supabase/types';

export async function saveUserReport(data: {
  name: string;
  description?: string;
  type: ReportType;
  startDate: string;
  endDate: string;
  parameters: Record<string, any>;
}) {
  try {
    const result = await saveReport({
      name: data.name,
      description: data.description,
      type: data.type,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      parameters: data.parameters,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error saving report:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to save report" 
    };
  }
}

export async function fetchUserReports(page: number = 1, itemsPerPage: number = 10) {
  try {
    const offset = (page - 1) * itemsPerPage;
    const result = await getUserReports({ 
      limit: itemsPerPage,
      offset,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch reports" 
    };
  }
}

export async function deleteUserReport(reportId: string) {
  try {
    const result = await deleteReport(reportId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error deleting report:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete report" 
    };
  }
} 