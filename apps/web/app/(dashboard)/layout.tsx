import { AppSidebar } from "@ui/layouts/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@synq/ui/sidebar";
import AppHeader from "@ui/layouts/header/app-header";
import AppContent from "@ui/layouts/content/app-content";
import * as React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "4rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="w-screen overflow-x-hidden">
        <AppHeader />
        <AppContent>{children}</AppContent>
      </SidebarInset>
    </SidebarProvider>
  );
}
