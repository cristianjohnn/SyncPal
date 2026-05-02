"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { Menu, Search, Bell } from "lucide-react";
import type { User } from "@/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { GlobalSearch } from "@/components/layout/global-search";

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href?: string }[] = [];

  const labelMap: Record<string, string> = {
    dashboard: "Dashboard",
    boards: "Boards",
    tasks: "My Tasks",
    admin: "Admin",
    users: "Users",
    settings: "Settings",
  };

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = labelMap[segment] || segment;
    breadcrumbs.push({ label, href: currentPath });
  }

  return breadcrumbs;
}

interface HeaderProps {
  user: User | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 md:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
          />
        }>
            <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[260px]">
          <Sidebar user={user} />
        </SheetContent>
      </Sheet>

      {/* Search Bar (Center) */}
      <div className="hidden md:flex flex-1 items-center justify-center px-6">
        <GlobalSearch />
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-destructive border border-background" />
              <span className="sr-only">Notifications</span>
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="font-normal flex justify-between items-center">
              <span className="font-semibold">Notifications</span>
              <span className="text-xs text-muted-foreground">2 unread</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem className="p-3 flex flex-col items-start gap-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <p className="text-sm font-medium">Alex mentioned you</p>
                </div>
                <p className="text-xs text-muted-foreground pl-4">"Can you review the design system?"</p>
                <span className="text-[10px] text-muted-foreground pl-4 mt-1">2 hours ago</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-3 flex flex-col items-start gap-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <p className="text-sm font-medium">Task updated</p>
                </div>
                <p className="text-xs text-muted-foreground pl-4">"API Endpoint" was moved to Done</p>
                <span className="text-[10px] text-muted-foreground pl-4 mt-1">5 hours ago</span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-0">
              <Link href="/notifications" className="w-full p-2 text-center text-primary text-sm font-medium hover:underline">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Avatar className="h-8 w-8 cursor-pointer border border-border">
          <AvatarImage src={user?.avatar_url || `https://avatar.vercel.sh/${user?.email || "user"}`} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {user ? getInitials(user.full_name) : "?"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
