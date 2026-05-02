"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "mention" | "status" | "system";
  read: boolean;
  created_at: string;
  link: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Alex mentioned you",
    description: "Can you review the design system updates?",
    type: "mention",
    read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    link: "/boards/1"
  },
  {
    id: "n2",
    title: "Task updated",
    description: "API Endpoint was moved to Done",
    type: "status",
    read: false,
    created_at: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
    link: "/tasks"
  },
  {
    id: "n3",
    title: "System Update",
    description: "Scheduled maintenance will occur tomorrow at 2 AM UTC.",
    type: "system",
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    link: "#"
  },
  {
    id: "n4",
    title: "Sarah assigned you a task",
    description: "Implement Navigation Bar is now assigned to you.",
    type: "status",
    read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    link: "/boards/1"
  }
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "mention":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "status":
        return <RefreshCw className="h-5 w-5 text-amber-500" />;
      case "system":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay up to date with your tasks and team.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You will see updates here when someone mentions you or tasks change."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <Card
              key={notification.id}
              className={`p-4 transition-all duration-200 ${
                !notification.read ? "bg-primary/5 border-primary/20" : "bg-card border-border"
              }`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={notification.link} className="hover:underline" onClick={() => markAsRead(notification.id)}>
                      <p className={`text-base font-semibold leading-snug ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.title}
                      </p>
                    </Link>
                    {!notification.read && (
                      <span className="shrink-0 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatRelativeTime(notification.created_at)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
