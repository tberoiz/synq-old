import type { Metadata } from "next";
import { ThemeProvider } from "./providers";
import "@repo/ui/globals.css";
import { Toaster } from "@repo/ui/toaster";

export const metadata: Metadata = {
  title: "Gaia",
  description: "description",
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
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
