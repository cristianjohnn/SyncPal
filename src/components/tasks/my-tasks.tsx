"use client";

import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckSquare, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import {
  getPriorityColor,
  getStatusColor,
  formatRelativeTime,
} from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/boards/task-dialog";
import type { TaskStatus } from "@/types/database";
import type {
  BoardDirectoryUser,
  KanbanPageSession,
  KanbanTask,
} from "@/lib/queries/boards";
import type { MyAssignedTask } from "@/lib/queries/tasks";
import { updateTask } from "@/app/(app)/boards/actions";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

interface MyTasksProps {
  initialTasks: MyAssignedTask[];
  users: BoardDirectoryUser[];
  session: KanbanPageSession;
}

export function MyTasks({ initialTasks, users, session }: MyTasksProps) {
  const [tasks, setTasks] = useState<MyAssignedTask[]>(initialTasks);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [boardFilter, setBoardFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  const [selectedTask, setSelectedTask] = useState<MyAssignedTask | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const boards = useMemo(() => {
    const uniqueBoards = new Map<string, { id: string; name: string }>();
    tasks.forEach((t) => {
      if (t.board && !uniqueBoards.has(t.board.id)) {
        uniqueBoards.set(t.board.id, t.board);
      }
    });
    return Array.from(uniqueBoards.values());
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (boardFilter !== "all") {
      result = result.filter((t) => t.board_id === boardFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "date_desc") {
        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      }
      if (sortBy === "date_asc") {
        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
      }
      if (sortBy === "priority_desc") {
        const pOrder: Record<string, number> = {
          urgent: 4,
          high: 3,
          medium: 2,
          low: 1,
        };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      return 0;
    });

    return result;
  }, [tasks, statusFilter, priorityFilter, boardFilter, sortBy]);

  const handleTaskUpdated = (updated: KanbanTask) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== updated.id) return t;
        return { ...updated, board: t.board };
      })
    );
    setSelectedTask((prev) =>
      prev?.id === updated.id ? { ...updated, board: prev.board } : prev
    );
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setDialogOpen(false);
    setSelectedTask(null);
  };

  const handleInlineStatusChange = async (
    task: MyAssignedTask,
    status: TaskStatus
  ) => {
    if (status === task.status) return;

    const snapshot = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status } : t))
    );
    setSelectedTask((prev) =>
      prev?.id === task.id ? { ...prev, status } : prev
    );

    const result = await updateTask({
      board_id: task.board_id,
      id: task.id,
      status,
    });

    if (!result.ok) {
      setTasks(snapshot);
      setSelectedTask((prev) =>
        prev?.id === task.id
          ? { ...prev, status: task.status }
          : prev
      );
      toast.error(result.error);
      return;
    }

    const board = task.board;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...result.data, board } : t
      )
    );
    setSelectedTask((prev) =>
      prev?.id === task.id ? { ...result.data, board } : prev
    );
  };

  const filterActiveCount =
    (statusFilter !== "all" ? 1 : 0) +
    (priorityFilter !== "all" ? 1 : 0) +
    (boardFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Tasks assigned to you across all boards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="gap-2 bg-background">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                  {filterActiveCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 px-1.5 min-w-5 flex items-center justify-center text-[10px]"
                    >
                      {filterActiveCount}
                    </Badge>
                  )}
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="todo">To Do</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="in_progress">
                  In Progress
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="review">
                  Review
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="done">Done</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={priorityFilter}
                onValueChange={setPriorityFilter}
              >
                <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="urgent">
                  Urgent
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="high">High</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="medium">
                  Medium
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="low">Low</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Board</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={boardFilter}
                onValueChange={setBoardFilter}
              >
                <DropdownMenuRadioItem value="all">
                  All Boards
                </DropdownMenuRadioItem>
                {boards.map((b) => (
                  <DropdownMenuRadioItem key={b.id} value={b.id}>
                    {b.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="gap-2 bg-background">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                <DropdownMenuRadioItem value="date_desc">
                  Newest First
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="date_asc">
                  Oldest First
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="priority_desc">
                  Highest Priority
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div>
        {tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="Nothing assigned yet"
            description="When teammates assign tasks to you, they will appear here."
          />
        ) : filteredAndSortedTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description="Try adjusting your filters or sort options."
          />
        ) : (
          <div className="space-y-3">
            {filteredAndSortedTasks.map((task, index) => (
              <Card
                key={task.id}
                onClick={() => {
                  setSelectedTask(task);
                  setDialogOpen(true);
                }}
                className="p-4 hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer animate-fade-in bg-card border-border group"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {task.board && (
                        <span className="text-xs font-medium text-foreground bg-muted/50 px-2 py-1 rounded-md">
                          {task.board.name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center">
                        Created {formatRelativeTime(task.created_at)}
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Badge
                      variant="secondary"
                      className={`text-xs px-2 py-0.5 ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </Badge>
                    <Select
                      value={task.status}
                      onValueChange={(v) =>
                        v &&
                        handleInlineStatusChange(task, v as TaskStatus)
                      }
                    >
                      <SelectTrigger
                        className={`h-8 w-[148px] text-xs ${getStatusColor(task.status)} border-border`}
                        aria-label="Change task status"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDialog
          mode="server"
          boardId={selectedTask.board_id}
          task={selectedTask}
          users={users}
          canDelete={
            session.isAdmin ||
            selectedTask.created_by === session.userId
          }
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}
