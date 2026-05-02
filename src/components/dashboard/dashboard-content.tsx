"use client";

import {
  GitBranch,
  GitPullRequest,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getInitials,
  formatRelativeTime,
  getStatusColor,
  getPriorityColor,
} from "@/lib/utils";
import { getActivityMessage } from "@/lib/activity";
import Link from "next/link";

interface DashboardContentProps {
  activeBranches: number;
  reviewBranches: number;
  completedTasks: number;
  boards: Array<{
    id: string;
    name: string;
    description: string | null;
    tasks?: Array<{ id: string; status: string }>;
  }>;
  activities: Array<{
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    created_at: string;
    user?: { id: string; full_name: string; avatar_url: string | null } | null;
  }>;
  myTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    board?: { id: string; name: string } | null;
  }>;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  delay,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
  trend?: string;
  delay: number;
}) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight animate-count-up">
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend && (
            <span className="text-emerald-500 flex items-center">
              <ArrowUpRight className="h-3 w-3" />
              {trend}
            </span>
          )}
          {description}
        </p>
      </CardContent>
      {/* Decorative gradient */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}

export function DashboardContent({
  activeBranches,
  reviewBranches,
  completedTasks,
  boards,
  activities,
  myTasks,
}: DashboardContentProps) {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your team&apos;s development activity
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Branches"
          value={activeBranches}
          icon={GitBranch}
          description="Currently in development"
          delay={0}
        />
        <MetricCard
          title="Ready for Merge"
          value={reviewBranches}
          icon={GitPullRequest}
          description="Pull requests in review"
          delay={100}
        />
        <MetricCard
          title="Completed This Week"
          value={completedTasks}
          icon={CheckCircle2}
          description="Tasks marked as done"
          delay={200}
        />
        <MetricCard
          title="Active Boards"
          value={boards.length}
          icon={Activity}
          description="Project boards"
          delay={300}
        />
      </div>

      {/* Lower section */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* My Tasks */}
        <Card className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">My Tasks</CardTitle>
            <Link
              href="/tasks"
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {myTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No pending tasks assigned to you
              </div>
            ) : (
              <div className="space-y-3">
                {myTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {task.title}
                      </p>
                      {task.board && (
                        <p className="text-xs text-muted-foreground truncate">
                          {task.board.name}
                        </p>
                      )}
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Recent Activity
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] pr-4">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  No recent activity
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 animate-fade-in"
                    >
                      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                        <AvatarImage
                          src={activity.user?.avatar_url || undefined}
                        />
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                          {activity.user
                            ? getInitials(activity.user.full_name)
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">
                            {activity.user?.full_name || "Unknown"}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {getActivityMessage(
                              activity.action,
                              activity.entity_type
                            )}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatRelativeTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Boards overview */}
      {boards.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: "600ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Boards</h2>
            <Link
              href="/boards"
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => {
              const tasksByStatus = {
                todo: board.tasks?.filter((t) => t.status === "todo").length || 0,
                in_progress: board.tasks?.filter((t) => t.status === "in_progress").length || 0,
                review: board.tasks?.filter((t) => t.status === "review").length || 0,
                done: board.tasks?.filter((t) => t.status === "done").length || 0,
              };
              const total = board.tasks?.length || 0;

              return (
                <Link key={board.id} href={`/boards/${board.id}`}>
                  <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer group">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        {board.name}
                      </CardTitle>
                      {board.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {board.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-[10px]">
                          {total} tasks
                        </Badge>
                        {tasksByStatus.in_progress > 0 && (
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${getStatusColor("in_progress")}`}
                          >
                            {tasksByStatus.in_progress} active
                          </Badge>
                        )}
                        {tasksByStatus.review > 0 && (
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${getStatusColor("review")}`}
                          >
                            {tasksByStatus.review} in review
                          </Badge>
                        )}
                      </div>
                      {/* Progress bar */}
                      {total > 0 && (
                        <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{
                              width: `${(tasksByStatus.done / total) * 100}%`,
                            }}
                          />
                          <div
                            className="h-full bg-amber-500 transition-all"
                            style={{
                              width: `${(tasksByStatus.review / total) * 100}%`,
                            }}
                          />
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{
                              width: `${(tasksByStatus.in_progress / total) * 100}%`,
                            }}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
