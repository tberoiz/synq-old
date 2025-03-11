import React, { memo } from "react";
import NavUser from "./nav-user";
import { SidebarFooter, SidebarTrigger } from "@synq/ui/sidebar";

const AppHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 flex shrink-0 items-center justify-between gap-2 border-b bg-background p-4">
      <div>
        <SidebarTrigger className="ml-1" />
      </div>
      <SidebarFooter>
        <div className="flex gap-2 items-center">
          <NavUser />
        </div>
      </SidebarFooter>
    </header>
  );
};

export default memo(AppHeader);
