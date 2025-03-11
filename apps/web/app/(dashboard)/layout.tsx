import { AppSidebar } from "@ui/shared/layouts/client/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@synq/ui/sidebar";
import AppHeader from "@ui/shared/layouts/client/header/app-header";
import AppContent from "@ui/shared/layouts/client/content/app-content";
import * as React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "12rem",
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
