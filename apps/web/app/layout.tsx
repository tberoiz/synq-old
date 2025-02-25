import type { Metadata } from "next";
import { SynqProviders } from "./providers";
import "@synq/ui/globals.css";
import { Toaster } from "@synq/ui/toaster";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./error-fallback";

export const metadata: Metadata = {
  title: "synq",
  description: "Sell everywhere. Sync in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SynqProviders>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
          </ErrorBoundary>
        </SynqProviders>
        <Toaster />
      </body>
    </html>
  );
}
