"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import {
  getPriorityColor,
  getStatusColor,
  formatRelativeTime,
} from "@/lib/utils";
import Link from "next/link";
import type { TaskStatus } from "@/types/database";

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: string;
  board_id: string;
  created_at: string;
  board?: { id: string; name: string } | null;
  assignee?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface MyTasksProps {
  tasks: TaskItem[];
}

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

export function MyTasks({ tasks }: MyTasksProps) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredTasks =
    activeTab === "all"
      ? tasks
      : tasks.filter((t) => t.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground mt-1">
          Tasks assigned to you across all boards
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {STATUS_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? tasks.length
                : tasks.filter((t) => t.status === tab.value).length;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5"
              >
                {tab.label}
                <span className="text-[10px] bg-muted rounded-full px-1.5 py-0.5 font-normal">
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks found"
              description={
                activeTab === "all"
                  ? "You don't have any tasks assigned to you yet"
                  : `No tasks with status "${activeTab.replace("_", " ")}"`
              }
            />
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task, index) => (
                <Link
                  key={task.id}
                  href={`/boards/${task.board_id}`}
                >
                  <Card
                    className="p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {task.board && (
                            <span className="text-[11px] text-muted-foreground">
                              {task.board.name}
                            </span>
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            · {formatRelativeTime(task.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${getStatusColor(task.status)}`}
                        >
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
