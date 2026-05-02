"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Search, Layout, CheckSquare, User as UserIcon } from "lucide-react";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <div 
        className="relative w-full max-w-md cursor-pointer group"
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <div
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-muted/50 pl-9 pr-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <span>Search tasks, boards...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Recent Searches">
            <CommandItem onSelect={() => runCommand(() => router.push('/boards/1'))}>
              <Layout className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Frontend Redesign</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/tasks'))}>
              <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Implement Navigation Bar</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Boards">
            <CommandItem onSelect={() => runCommand(() => router.push('/boards/1'))}>
              <Layout className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Frontend Redesign</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/boards/2'))}>
              <Layout className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Backend Performance</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Tasks">
            <CommandItem onSelect={() => runCommand(() => router.push('/tasks'))}>
              <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Design System Migration</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/tasks'))}>
              <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Update Auth Flow</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandGroup heading="People">
            <CommandItem onSelect={() => runCommand(() => {})}>
              <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Alex Developer</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => {})}>
              <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Sarah Chen</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
