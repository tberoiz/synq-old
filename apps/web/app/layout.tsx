import type { Metadata } from "next";
import { SynqProviders } from "./providers";
import "@synq/ui/globals.css";
import { Toaster } from "@synq/ui/toaster";

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
        <SynqProviders>{children}</SynqProviders>
        <Toaster />
      </body>
    </html>
  );
}
