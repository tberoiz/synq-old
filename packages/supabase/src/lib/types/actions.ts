export interface AppError {
  code: string;
  message: string;
}

export interface ActionError {
  code: string;
  message: string;
}

export interface PDFReportData {
  pdf: string;
  filename: string;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ActionError;
}
