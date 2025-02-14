import type { Metadata } from "next";
import { ThemeProvider } from "./providers";
import "@synq/ui/globals.css";
import { Toaster } from "@synq/ui/toaster";

export const metadata: Metadata = {
  title: "synq",
  description: "Sell everywhere. Sync in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "neon", "system"]}
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
