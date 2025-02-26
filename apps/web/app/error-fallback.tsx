"use client";

import React from "react";

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div
      role="alert"
      className="p-4 bg-red-100 border border-red-400 text-red-700 rounded"
    >
      <p>Something went wrong:</p>
      <pre className="whitespace-pre-wrap">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Try again
      </button>
    </div>
  );
}
