"use client";

import {
  GitBranch,
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowUpRight,
  Clock,
  Plus,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import type {
  DashboardActivityItem,
  DashboardStat,
  DashboardStatVariant,
} from "@/lib/queries/dashboard";

const STAT_ICONS: Record<DashboardStatVariant, LucideIcon> = {
  ongoing_branches: GitBranch,
  ready_merge: GitPullRequest,
  completed_week: CheckCircle2,
  rework: AlertCircle,
};

export interface DashboardContentProps {
  greetingName: string;
  pendingReviewCount: number;
  stats: DashboardStat[];
  activity: DashboardActivityItem[];
}

export function DashboardContent({
  greetingName,
  pendingReviewCount,
  stats,
  activity,
}: DashboardContentProps) {
  const reviewPhrase =
    pendingReviewCount === 0
      ? "You're all caught up on reviews."
      : pendingReviewCount === 1
        ? "You have 1 task pending review."
        : `You have ${pendingReviewCount} tasks pending review.`;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back, {greetingName} ✨
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Here&apos;s what&apos;s happening with your projects today.{" "}
            {reviewPhrase}
          </p>
        </div>
        {/* Decorative background elements */}
        <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 font-medium">
          <Plus className="h-4 w-4" />
          Create Board
        </Button>
        <Button variant="secondary" className="gap-2 h-10 px-6 font-medium">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
        <Link
          href="/tasks"
          className={buttonVariants({
            variant: "outline",
            className: "gap-2 h-10 px-6 font-medium bg-background",
          })}
        >
          <CheckSquare className="h-4 w-4" />
          View My Tasks
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = STAT_ICONS[stat.variant];
          return (
            <Card
              key={stat.variant}
              className="relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200 border-border bg-card"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${stat.color}`} />
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground/70 shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight mb-1">
                  {stat.value}
                </div>
                {stat.trend ? (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-medium bg-muted/50 text-muted-foreground"
                  >
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {stat.trend}
                  </Badge>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Workspace total
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          Recent Activity
        </h2>
        <Card className="border-border bg-card overflow-hidden">
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-border">
                {activity.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No activity yet. Actions on boards, tasks, and branches will
                    show up here once logging is wired through your workflows.
                  </div>
                ) : (
                  activity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={item.avatarUrl ?? undefined} />
                        <AvatarFallback>
                          {item.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold text-foreground">
                            {item.userName}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {item.description}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.timeLabel}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-border bg-muted/20 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground w-full"
                disabled={activity.length === 0}
              >
                Load more activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
