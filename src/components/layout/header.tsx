"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { Menu, Search } from "lucide-react";
import type { User } from "@/types/database";

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

      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-muted-foreground/40">/</span>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium">{crumb.label}</span>
            ) : (
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-default">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Mobile title */}
      <div className="md:hidden flex-1">
        <h1 className="text-lg font-semibold">
          {breadcrumbs[breadcrumbs.length - 1]?.label || "Synqr"}
        </h1>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-muted-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
