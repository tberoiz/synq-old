"use client";

// REACT
import { useEffect, useState, memo, useMemo } from "react";
import Link from "next/link";

// UI COMPONENTS
import { Avatar, AvatarImage } from "@synq/ui/avatar";
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
import { Button } from "@synq/ui/button";

// ICONS
import { BadgeCheck, LogOut } from "lucide-react";

// API
import { getUserMetadata, signOut } from "@synq/supabase/queries";

// Custom hook for user metadata
const useUserMetadata = () => {
  const [userMetadata, setUserMetadata] = useState<{
    name: string;
    email: string;
    avatar_url: string;
  }>({
    name: "",
    email: "",
    avatar_url: "",
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      const metadata = await getUserMetadata();
      console.log(metadata);
      setUserMetadata({
        name: metadata?.full_name || "",
        email: metadata?.email || "",
        avatar_url: metadata?.avatar_url || "",
      });
    };

    fetchUserInfo();
  }, []);

  return userMetadata;
};

const NavUser: React.FC = () => {
  const { isMobile } = useSidebar();
  const userMetadata = useUserMetadata();

  // Memoize the dropdown content
  const dropdownContent = useMemo(() => (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            {userMetadata.avatar_url ? (
              <AvatarImage
                src={userMetadata.avatar_url}
                alt={userMetadata.name}
              />
            ) : (
              <AvatarImage
                src="user/avatar_placeholder.png"
                alt="Avatar placeholder"
                className="bg-gray-400"
              />
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
        <Button
          onClick={signOut}
          className="flex w-full items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </Button>
      </DropdownMenuItem>
    </>
  ), [userMetadata]);

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
                  <AvatarImage
                    src="user/avatar_placeholder.png"
                    alt="Avatar placeholder"
                    className="bg-gray-400"
                  />
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
            {dropdownContent}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default memo(NavUser);
