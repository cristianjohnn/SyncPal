import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/boards/kanban-board";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: board } = await supabase
    .from("boards")
    .select("name")
    .eq("id", id)
    .single();

  return {
    title: board?.name || "Board",
  };
}

export default async function BoardPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("id", id)
    .single();

  if (!board) notFound();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, assignee:users!tasks_assigned_to_fkey(id, full_name, avatar_url), branches(*)")
    .eq("board_id", id)
    .order("created_at", { ascending: true });

  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, avatar_url, email");

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: currentUserProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", currentUser?.id || "")
    .single();

  return (
    <KanbanBoard
      board={board}
      tasks={tasks || []}
      users={users || []}
      isAdmin={currentUserProfile?.role === "admin"}
    />
  );
}
