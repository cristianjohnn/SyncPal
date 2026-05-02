import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch metrics
  const [
    { count: activeBranches },
    { count: reviewBranches },
    { data: recentTasks },
    { data: boards },
    { data: activities },
    { data: myTasks },
  ] = await Promise.all([
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
      .select("*")
      .eq("status", "done")
      .gte(
        "updated_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      ),
    supabase
      .from("boards")
      .select("*, tasks(id, status)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("activity_log")
      .select("*, user:users(id, full_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("tasks")
      .select("*, board:boards(id, name)")
      .eq("assigned_to", user?.id || "")
      .neq("status", "done")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <DashboardContent
      activeBranches={activeBranches || 0}
      reviewBranches={reviewBranches || 0}
      completedTasks={recentTasks?.length || 0}
      boards={boards || []}
      activities={activities || []}
      myTasks={myTasks || []}
    />
  );
}
