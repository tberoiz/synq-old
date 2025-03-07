// TODO: Refactor this file
// TODO: Implement Sentry

/**
 * Custom error class for application-specific errors.
 */
export class AppError extends Error {
  constructor(
    public readonly code: string, // Error code (e.g., "VALIDATION_ERROR", "FETCH_FAILED")
    public readonly message: string, // Human-readable error message
    public readonly context?: Record<string, unknown>, // Additional context for debugging
  ) {
    super(message);
    this.name = "AppError";
  }

  /**
   * Convert the error to a plain object for logging or API responses.
   */
  toObject() {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Handle Supabase errors and convert them to AppError.
 * @param error - The error object from Supabase or other sources.
 * @param context - Contextual information about where the error occurred.
 * @throws AppError
 */
export const handleSupabaseError = (error: any, context: string): never => {
  // Log the error for debugging
  console.error(`[Supabase Error] ${context}:`, {
    error,
    timestamp: new Date().toISOString(),
  });

  // Handle Supabase-specific errors
  if (error instanceof Error && "code" in error) {
    const supabaseError = error as { code: string; message: string };
    throw new AppError(
      supabaseError.code || "SUPABASE_ERROR",
      supabaseError.message || "An unexpected Supabase error occurred",
      { context, supabaseError },
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    throw new AppError("UNKNOWN_ERROR", error.message, { context });
  }

  // Handle non-Error objects (e.g., strings or plain objects)
  throw new AppError("UNKNOWN_ERROR", "An unexpected error occurred", {
    context,
    originalError: error,
  });
};

/**
 * Utility function to log errors in a structured way.
 */
export const logError = (error: unknown, context: string) => {
  if (error instanceof AppError) {
    console.error(`[AppError] ${context}:`, error.toObject());
  } else if (error instanceof Error) {
    console.error(`[Error] ${context}:`, {
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error(`[Unknown Error] ${context}:`, error);
  }
};

/**
 * Utility function to check if an error is an AppError.
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

/**
 * Utility function to create a standardized error response for APIs.
 */
export const createErrorResponse = (error: unknown) => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.toObject(),
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error.message,
      },
    };
  }

  return {
    success: false,
    error: {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
    },
  };
};
