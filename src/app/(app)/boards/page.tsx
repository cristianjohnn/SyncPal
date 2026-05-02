import { createClient } from "@/lib/supabase/server";
import { BoardsList } from "@/components/boards/boards-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boards",
};

export default async function BoardsPage() {
  const supabase = await createClient();

  const { data: boards } = await supabase
    .from("boards")
    .select("*, creator:users!boards_created_by_fkey(id, full_name, avatar_url), tasks(id, status)")
    .order("created_at", { ascending: false });

  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, avatar_url");

  return <BoardsList boards={boards || []} users={users || []} />;
}
