import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    todo: "bg-muted text-muted-foreground",
    in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    review: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    done: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    ongoing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    merged: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
  return colors[status] || "bg-muted text-muted-foreground";
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    high: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    urgent: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };
  return colors[priority] || "bg-muted text-muted-foreground";
}

export function getPriorityIcon(priority: string): string {
  const icons: Record<string, string> = {
    low: "⬇",
    medium: "➡",
    high: "⬆",
    urgent: "🔴",
  };
  return icons[priority] || "➡";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
