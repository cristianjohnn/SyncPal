"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckSquare, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { getPriorityColor, getStatusColor, formatRelativeTime } from "@/lib/utils";
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
import type { TaskStatus, TaskPriority } from "@/types/database";

const MOCK_USERS = [
  { id: "u1", full_name: "Alex Developer", avatar_url: "https://avatar.vercel.sh/alex", email: "alex@example.com" },
];

const MOCK_TASKS = [
  {
    id: "t1",
    title: "Implement Navigation Bar",
    description: "Create the top navigation bar with user profile and search.",
    status: "done" as TaskStatus,
    priority: "high" as TaskPriority,
    board_id: "1",
    board: { id: "1", name: "Frontend Redesign" },
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    assigned_to: "u1",
    created_by: "u2",
    assignee: MOCK_USERS[0]
  },
  {
    id: "t2",
    title: "Design System Migration",
    description: "Move all colors and fonts to globals.css.",
    status: "in_progress" as TaskStatus,
    priority: "urgent" as TaskPriority,
    board_id: "1",
    board: { id: "1", name: "Frontend Redesign" },
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date().toISOString(),
    assigned_to: "u1",
    created_by: "u1",
    assignee: MOCK_USERS[0]
  },
  {
    id: "t3",
    title: "API Endpoint Caching",
    description: "Add Redis caching to expensive API endpoints.",
    status: "todo" as TaskStatus,
    priority: "medium" as TaskPriority,
    board_id: "2",
    board: { id: "2", name: "Backend Performance" },
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    assigned_to: "u1",
    created_by: "u2",
    assignee: MOCK_USERS[0]
  }
];

export function MyTasks() {
  const [tasks, setTasks] = useState<any[]>(MOCK_TASKS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [boardFilter, setBoardFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const boards = useMemo(() => {
    const uniqueBoards = new Map();
    tasks.forEach(t => {
      if (t.board && !uniqueBoards.has(t.board.id)) {
        uniqueBoards.set(t.board.id, t.board);
      }
    });
    return Array.from(uniqueBoards.values());
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Filters
    if (statusFilter !== "all") {
      result = result.filter(t => t.status === statusFilter);
    }
    if (priorityFilter !== "all") {
      result = result.filter(t => t.priority === priorityFilter);
    }
    if (boardFilter !== "all") {
      result = result.filter(t => t.board_id === boardFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "date_desc") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "date_asc") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "priority_desc") {
        const pOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      return 0;
    });

    return result;
  }, [tasks, statusFilter, priorityFilter, boardFilter, sortBy]);

  const handleTaskUpdate = (updatedTask: any) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setDialogOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Tasks assigned to you across all boards
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" className="gap-2 bg-background">
                <SlidersHorizontal className="h-4 w-4" />
                Filter
                {(statusFilter !== 'all' || priorityFilter !== 'all' || boardFilter !== 'all') && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-5 flex items-center justify-center text-[10px]">
                    {(statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0) + (boardFilter !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="todo">To Do</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="in_progress">In Progress</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="review">Review</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="done">Done</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={priorityFilter} onValueChange={setPriorityFilter}>
                <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="urgent">Urgent</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="high">High</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="low">Low</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Board</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={boardFilter} onValueChange={setBoardFilter}>
                <DropdownMenuRadioItem value="all">All Boards</DropdownMenuRadioItem>
                {boards.map(b => (
                  <DropdownMenuRadioItem key={b.id} value={b.id}>{b.name}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" className="gap-2 bg-background">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                <DropdownMenuRadioItem value="date_desc">Newest First</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="date_asc">Oldest First</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="priority_desc">Highest Priority</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Task List */}
      <div>
        {filteredAndSortedTasks.length === 0 ? (
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
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="secondary"
                      className={`text-xs px-2 py-0.5 ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-xs px-2 py-0.5 ${getStatusColor(task.status)}`}
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Task detail dialog */}
      {selectedTask && (
        <TaskDialog
          task={selectedTask}
          users={MOCK_USERS}
          isAdmin={true}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  );
}
