import type { Metadata } from "next";
import { SynqProviders } from "./providers";
import "@synq/ui/globals.css";
import { Toaster } from "@synq/ui/toaster";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./error-fallback";

// Vercel
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "synq",
  description: "Sell everywhere. Sync in one place.",
  icons: {
    icon: [
      { url: "/brand/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon/favicon.ico", sizes: "48x48" },
    ],
    apple: [
      { url: "/brand/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/brand/favicon/favicon.ico",
      },
    ],
  },
  manifest: "/brand/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SpeedInsights />
        <Analytics />
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
