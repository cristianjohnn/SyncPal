import { cn, getPriorityColor } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GitBranch } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    priority: string;
    assignee?: { id: string; full_name: string; avatar_url: string | null } | null;
    branches?: Array<{ id: string; name: string; status: string }>;
  };
  isDragging?: boolean;
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const priorityColors: Record<string, string> = {
    low: "bg-slate-400",
    medium: "bg-blue-400",
    high: "bg-amber-400",
    urgent: "bg-red-500",
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-primary/20",
        isDragging && "shadow-xl rotate-2 border-primary/30 scale-105"
      )}
    >
      {/* Priority bar */}
      <div
        className={cn(
          "h-0.5 w-8 rounded-full mb-2.5",
          priorityColors[task.priority] || "bg-slate-400"
        )}
      />

      {/* Title */}
      <p className="text-sm font-medium leading-snug mb-2.5 line-clamp-2">
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Badge
            variant="secondary"
            className={cn("text-[10px] px-1.5 py-0", getPriorityColor(task.priority))}
          >
            {task.priority}
          </Badge>
          {task.branches && task.branches.length > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
              <GitBranch className="h-2.5 w-2.5" />
              {task.branches.length}
            </Badge>
          )}
        </div>
        {task.assignee && (
          <Avatar className="h-5 w-5">
            <AvatarImage src={task.assignee.avatar_url || undefined} />
            <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-semibold">
              {getInitials(task.assignee.full_name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
