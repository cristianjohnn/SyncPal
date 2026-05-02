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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

// Mock Data
const MOCK_USER = {
  name: "Alex Developer",
};

const STAT_CARDS = [
  {
    title: "Ongoing Branches",
    value: 12,
    trend: "+2 vs last week",
    color: "bg-emerald-500",
    icon: GitBranch,
  },
  {
    title: "Ready for Merge",
    value: 4,
    trend: "+1 vs last week",
    color: "bg-purple-500",
    icon: GitPullRequest,
  },
  {
    title: "Completed This Week",
    value: 28,
    trend: "+5 vs last week",
    color: "bg-emerald-500",
    icon: CheckCircle2,
  },
  {
    title: "Rework Count",
    value: 3,
    trend: "-2 vs last week",
    color: "bg-red-500",
    icon: AlertCircle,
  },
];

const RECENT_ACTIVITY = [
  {
    id: "1",
    user: "Sarah Chen",
    action: "merged PR #142 into main",
    time: "2 hours ago",
    avatar: "https://avatar.vercel.sh/sarah",
  },
  {
    id: "2",
    user: "Mike Johnson",
    action: "moved task 'Update Auth Flow' to In Progress",
    time: "4 hours ago",
    avatar: "https://avatar.vercel.sh/mike",
  },
  {
    id: "3",
    user: "Alex Developer",
    action: "commented on 'Fix navigation bug'",
    time: "5 hours ago",
    avatar: "https://avatar.vercel.sh/alex",
  },
  {
    id: "4",
    user: "Emily Davis",
    action: "created new board 'Q3 Roadmap'",
    time: "1 day ago",
    avatar: "https://avatar.vercel.sh/emily",
  },
  {
    id: "5",
    user: "Chris Wilson",
    action: "assigned you to 'Refactor API Routes'",
    time: "2 days ago",
    avatar: "https://avatar.vercel.sh/chris",
  },
];

export function DashboardContent() {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back, {MOCK_USER.name} ✨
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Here's what's happening with your projects today. You have 5 tasks pending review.
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
        <Link href="/tasks" className={buttonVariants({ variant: "outline", className: "gap-2 h-10 px-6 font-medium bg-background" })}>
          <CheckSquare className="h-4 w-4" />
          View My Tasks
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200 border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${stat.color}`} />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight mb-1">
                {stat.value}
              </div>
              <Badge variant="secondary" className="text-[10px] font-medium bg-muted/50 text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {stat.trend}
              </Badge>
            </CardContent>
          </Card>
        ))}
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
                {RECENT_ACTIVITY.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-border bg-muted/20 text-center">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground w-full">
                Load more activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
