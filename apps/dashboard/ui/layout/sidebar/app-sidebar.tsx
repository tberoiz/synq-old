"use client";

import * as React from "react";
import {
  ChartLine,
  Package,
  WalletCards,
  Command,
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
} from "@repo/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Overview",
      url: "#",
      icon: ChartLine,
      isActive: true,
    },
    {
      title: "Orders",
      url: "#",
      icon: WalletCards,
      isActive: false,
    },
    {
      title: "Inventory",
      url: "#",
      icon: Package,
      isActive: false,
    },
    {
      title: "Integrations",
      url: "#",
      icon: Blocks,
      isActive: false,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      isActive: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // TODO: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = React.useState(data.navMain[0]!);
  const { isMobile } = useSidebar();

  return (
    <>
      <Sidebar variant="sidebar" className="border-r py-2" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command />
                  </div>
                  {isMobile && (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Acme Inc</span>
                      <span className="truncate text-xs">Enterprise</span>
                    </div>
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item);
                        //TODO: Close the sidebar when routing in mobile to enhance user experience
                      }}
                      isActive={activeItem.title === item.title}
                      className={`px-2.5 md:px-2 ${isMobile ? "" : "size-12"}`}
                    >
                      <item.icon
                        style={{
                          width: isMobile ? undefined : "1.2rem",
                          height: isMobile ? undefined : "1.2rem",
                        }}
                      />
                      {isMobile && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
