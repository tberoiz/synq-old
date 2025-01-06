import React, { memo } from "react";
import NavUser from "./nav-user";
import { Button } from "@repo/ui/button";
import { SidebarFooter, SidebarTrigger } from "@repo/ui/sidebar";
import { Bell } from "lucide-react";

const AppHeader: React.FC = () => {
  return (
    <header className="sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b bg-background p-2">
      <div>
        <SidebarTrigger className="ml-1" />
      </div>
      <SidebarFooter>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full h-8 w-8 px-4 relative"
          >
            <Bell className="size-4" />
            <div
              className="absolute right-0 top-0 w-2 h-2 rounded-full"
              style={{ backgroundColor: "rgb(255, 208, 43)" }}
            />
          </Button>

          <NavUser />
        </div>
      </SidebarFooter>
    </header>
  );
};

export default memo(AppHeader);
