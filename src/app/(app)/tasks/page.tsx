import { createClient } from "@/lib/supabase/server";
import { MyTasks } from "@/components/tasks/my-tasks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Tasks",
};

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, board:boards(id, name), assignee:users!tasks_assigned_to_fkey(id, full_name, avatar_url)")
    .eq("assigned_to", user?.id || "")
    .order("created_at", { ascending: false });

  return <MyTasks tasks={tasks || []} />;
}
