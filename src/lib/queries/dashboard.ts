import { formatDistanceToNow } from "date-fns";
import { startOfWeek, subWeeks } from "date-fns";
import { getActivityMessage } from "@/lib/activity-format";
import { createClient } from "@/lib/supabase/server";
import type { ActivityLog } from "@/types/database";

export type DashboardStatVariant =
  | "ongoing_branches"
  | "ready_merge"
  | "completed_week"
  | "rework";

export interface DashboardStat {
  title: string;
  value: number;
  trend: string | null;
  color: string;
  variant: DashboardStatVariant;
}

export interface DashboardActivityItem {
  id: string;
  userName: string;
  description: string;
  avatarUrl: string | null;
  timeLabel: string;
}

export interface DashboardPageData {
  greetingName: string;
  pendingReviewCount: number;
  stats: DashboardStat[];
  activity: DashboardActivityItem[];
}

function formatWoWTrend(thisPeriod: number, previousPeriod: number): string {
  const delta = thisPeriod - previousPeriod;
  if (delta === 0) return "Same as last week";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta} vs last week`;
}

function describeLogRow(log: ActivityLog): string {
  const meta = log.metadata as Record<string, unknown> | null;
  const title =
    typeof meta?.title === "string"
      ? meta.title
      : typeof meta?.task_title === "string"
        ? meta.task_title
        : typeof meta?.board_name === "string"
          ? meta.board_name
          : typeof meta?.branch_name === "string"
            ? meta.branch_name
            : null;
  const base = getActivityMessage(log.action, log.entity_type);
  if (title) return `${base}: "${title}"`;
  return base;
}

export async function fetchDashboardPageData(): Promise<
  | { ok: true; data: DashboardPageData }
  | { ok: false; error: string }
> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { ok: false, error: "Not authenticated." };
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const prevWeekStart = subWeeks(weekStart, 1);
  const wsIso = weekStart.toISOString();
  const pwsIso = prevWeekStart.toISOString();

  const [
    profileResult,
    pendingReviewResult,
    ongoingBranchesResult,
    readyMergeResult,
    completedThisWeekResult,
    completedPrevWeekResult,
    reworkResult,
    activityResult,
  ] = await Promise.all([
    supabase
      .from("users")
      .select("full_name")
      .eq("id", authUser.id)
      .single(),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("assigned_to", authUser.id)
      .eq("status", "review"),
    supabase
      .from("branches")
      .select("*", { count: "exact", head: true })
      .eq("status", "ongoing"),
    supabase
      .from("branches")
      .select("*", { count: "exact", head: true })
      .eq("status", "review"),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "done")
      .gte("updated_at", wsIso),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "done")
      .gte("updated_at", pwsIso)
      .lt("updated_at", wsIso),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "review"),
    supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  if (profileResult.error || !profileResult.data) {
    return {
      ok: false,
      error: profileResult.error?.message ?? "Could not load your profile.",
    };
  }

  const queryErrors = [
    pendingReviewResult.error,
    ongoingBranchesResult.error,
    readyMergeResult.error,
    completedThisWeekResult.error,
    completedPrevWeekResult.error,
    reworkResult.error,
    activityResult.error,
  ].filter(Boolean);

  if (queryErrors.length > 0) {
    return {
      ok: false,
      error:
        queryErrors[0]?.message ??
        "Something went wrong loading dashboard metrics.",
    };
  }

  const logs = (activityResult.data ?? []) as ActivityLog[];
  const userIds = [...new Set(logs.map((l) => l.user_id))];

  let userMap = new Map<
    string,
    { full_name: string; avatar_url: string | null }
  >();

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("users")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    if (profilesError) {
      return {
        ok: false,
        error: profilesError.message,
      };
    }

    userMap = new Map(
      (profiles ?? []).map((p) => [
        p.id,
        { full_name: p.full_name, avatar_url: p.avatar_url },
      ])
    );
  }

  const completedThis = completedThisWeekResult.count ?? 0;
  const completedPrev = completedPrevWeekResult.count ?? 0;

  const stats: DashboardStat[] = [
    {
      title: "Ongoing Branches",
      value: ongoingBranchesResult.count ?? 0,
      trend: null,
      color: "bg-emerald-500",
      variant: "ongoing_branches",
    },
    {
      title: "Ready for Merge",
      value: readyMergeResult.count ?? 0,
      trend: null,
      color: "bg-purple-500",
      variant: "ready_merge",
    },
    {
      title: "Completed This Week",
      value: completedThis,
      trend: formatWoWTrend(completedThis, completedPrev),
      color: "bg-emerald-500",
      variant: "completed_week",
    },
    {
      title: "Rework Count",
      value: reworkResult.count ?? 0,
      trend: null,
      color: "bg-red-500",
      variant: "rework",
    },
  ];

  const activity: DashboardActivityItem[] = logs.map((log) => {
    const actor = userMap.get(log.user_id);
    return {
      id: log.id,
      userName: actor?.full_name ?? "Someone",
      description: describeLogRow(log),
      avatarUrl: actor?.avatar_url ?? null,
      timeLabel: formatDistanceToNow(new Date(log.created_at), {
        addSuffix: true,
      }),
    };
  });

  return {
    ok: true,
    data: {
      greetingName: profileResult.data.full_name,
      pendingReviewCount: pendingReviewResult.count ?? 0,
      stats,
      activity,
    },
  };
}
