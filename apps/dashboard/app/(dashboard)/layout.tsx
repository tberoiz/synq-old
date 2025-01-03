import { AppSidebar } from "@ui/layout/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@repo/ui/sidebar";
import AppHeader from "@ui/layout/header/app-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "50px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
