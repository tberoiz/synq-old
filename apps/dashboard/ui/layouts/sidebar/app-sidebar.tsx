"use client";

import * as React from "react";
import {
  ChartLine,
  Package,
  WalletCards,
  Blocks,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@refrom/ui/sidebar";
import Link from "next/link";
import { cn } from "@refrom/ui/utils";
import { ReFromIcon } from "@ui/icons/icons";
import { usePathname } from "next/navigation";

const data = {
  navMain: [
    { title: "Overview", url: "/overview", icon: ChartLine },
    { title: "Orders", url: "/orders", icon: WalletCards },
    { title: "Inventory", url: "/inventory", icon: Package },
    { title: "Integrations", url: "/integrations", icon: Blocks },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar variant="sidebar" className="border-r py-4 z-40" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="md:h-10 md:p-0 flex justify-center"
            >
              <Link href="/overview">
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ReFromIcon />
                </div>
                {isMobile && (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">ReFrom</span>
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu className="flex flex-col gap-4">
              {data.navMain.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <Link href={item.url} passHref>
                      <SidebarMenuButton
                        tooltip={{ children: item.title, hidden: false }}
                        onClick={() => isMobile && setOpenMobile(false)}
                        isActive={isActive}
                        className={cn(
                          "p-4 md:p-2 flex items-center gap-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-primary text-white dark:text-black "
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <item.icon
                          strokeWidth={1}
                          className="w-6 h-6"
                        />
                        {isMobile && <span>{item.title}</span>}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
