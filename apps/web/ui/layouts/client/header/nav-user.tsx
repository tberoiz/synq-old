"use client";
import { useEffect, useState, memo } from "react";
import { BadgeCheck, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@synq/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@synq/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@synq/ui/sidebar";
import { createClient } from "@synq/supabase/client";
import Link from "next/link";
import { signOut } from "@ui/features/auth/components/actions";

// Helper function to get the first character of a name
const getFirstCharacter = (fullName: string) => {
  return fullName.charAt(0).toUpperCase() || "";
};

const NavUser: React.FC = () => {
  const { isMobile } = useSidebar();
  const [userMetadata, setUserMetadata] = useState<{
    name: string;
    email: string;
    avatar_url: string;
  }>({
    name: "",
    email: "",
    avatar_url: "",
  });

  // Fetch user info on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const metadata = user?.user_metadata;
      setUserMetadata({
        name: metadata?.full_name || "",
        email: metadata?.email || "",
        avatar_url: metadata?.avatar_url || "",
      });
    };

    fetchUserInfo();
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <Avatar className="h-8 w-8 rounded-full">
                {userMetadata.avatar_url ? (
                  <AvatarImage
                    src={userMetadata.avatar_url}
                    alt={userMetadata.name}
                  />
                ) : (
                  <AvatarFallback className="flex items-center justify-center rounded-full bg-gray-400 text-white">
                    {getFirstCharacter(userMetadata.name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "bottom"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {userMetadata.avatar_url ? (
                    <AvatarImage
                      src={userMetadata.avatar_url}
                      alt={userMetadata.name}
                    />
                  ) : (
                    <AvatarFallback className="flex items-center justify-center rounded-lg bg-gray-400 text-white">
                      {getFirstCharacter(userMetadata.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {userMetadata.name}
                  </span>
                  <span className="truncate text-xs">{userMetadata.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/settings">
                <DropdownMenuItem>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default memo(NavUser);
