"use client";

// REACT
import * as React from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

// UI COMPONENTS
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@synq/ui/sidebar";
import { cn } from "@synq/ui/utils";
import { SynqIcon } from "@ui/shared/icons/icons";

// ICONS
import {
  ChartLine,
  Package,
  WalletCards,
  Settings,
  Receipt,
} from "lucide-react";

const navItems = [
  { title: "Overview", url: "/overview", icon: ChartLine },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Sales", url: "/sales", icon: WalletCards },
  { title: "Reports", url: "/reports", icon: Receipt },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const segment = useSelectedLayoutSegment();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar
      variant="sidebar"
      className="border-r py-3 z-40 bg-sidebar"
      {...props}
    >
      <SidebarHeader className="flex items-start justify-start">
        <SidebarMenu className="flex-wrap">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-10 md:p-0">
              <Link href="/overview">
                <SynqIcon />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col items-center justify-center flex-1">
            <SidebarMenu className="flex flex-col gap-2 w-full">
              {navItems.map(({ title, url, icon: Icon }) => {
                const isActive = segment === url.slice(1); // Remove leading slash
                return (
                  <SidebarMenuItem key={title}>
                    <Link href={url}>
                      <SidebarMenuButton
                        onClick={() => isMobile && setOpenMobile(false)}
                        isActive={isActive}
                        className={cn(
                          "flex items-center justify-start hover:bg-primary hover:text-primary-foreground gap-3 px-4 py-2 rounded-lg transition-colors h-12 w-full",
                          isActive && "bg-primary font-medium text-primary-foreground"
                        )}
                      >
                        <Icon className="w-6 h-6 mr-2" />
                        <span className="flex-1 min-w-[100px]">{title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent className="px-4 pb-4 text-sm">
            <div className="border-t border-gray-200 pt-4">
              <Link
                href="https://trysynq.com"
                target="_blank"
                className="hover:text-gray-900"
              >
                Documentation
              </Link>
            </div>
            <div className="mt-2">App Version: 0.0.1</div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
