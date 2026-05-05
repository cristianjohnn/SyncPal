import { createClient } from "@/lib/supabase/server";
import type { KanbanTask } from "@/lib/queries/boards";
import {
  BoardDirectoryUser,
  KanbanPageSession,
  normalizeKanbanTaskRow,
} from "@/lib/queries/boards";

export type MyAssignedTask = KanbanTask & {
  board: { id: string; name: string } | null;
};

export interface MyTasksPageData {
  tasks: MyAssignedTask[];
  users: BoardDirectoryUser[];
  session: KanbanPageSession;
}

function parseBoardEmbed(row: Record<string, unknown>): {
  id: string;
  name: string;
} | null {
  const raw = row.board;
  if (!raw || typeof raw !== "object") return null;
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (!first || typeof first !== "object") return null;
    const o = first as Record<string, unknown>;
    if (typeof o.id === "string" && typeof o.name === "string") {
      return { id: o.id, name: o.name };
    }
    return null;
  }
  const o = raw as Record<string, unknown>;
  if (typeof o.id === "string" && typeof o.name === "string") {
    return { id: o.id, name: o.name };
  }
  return null;
}

function normalizeMyAssignedTaskRow(row: unknown): MyAssignedTask | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const board = parseBoardEmbed(r);
  const base = normalizeKanbanTaskRow(row);
  if (!base) return null;
  return { ...base, board };
}

export async function fetchMyTasksPageData(): Promise<
  | { ok: true; data: MyTasksPageData }
  | { ok: false; error: string }
> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { ok: false, error: "Not authenticated." };
  }

  const [profileResult, tasksResult, usersResult] = await Promise.all([
    supabase.from("users").select("role").eq("id", authUser.id).single(),
    supabase
      .from("tasks")
      .select(
        `
        *,
        assignee:users!tasks_assigned_to_fkey(id, full_name, avatar_url),
        branches(*),
        board:boards!tasks_board_id_fkey(id, name)
      `
      )
      .eq("assigned_to", authUser.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("users")
      .select("id, full_name, avatar_url, email")
      .order("full_name", { ascending: true }),
  ]);

  if (profileResult.error || !profileResult.data) {
    return {
      ok: false,
      error: profileResult.error?.message ?? "Could not load profile.",
    };
  }

  if (tasksResult.error) {
    return { ok: false, error: tasksResult.error.message };
  }

  if (usersResult.error) {
    return { ok: false, error: usersResult.error.message };
  }

  const tasks: MyAssignedTask[] = [];
  for (const row of tasksResult.data ?? []) {
    const normalized = normalizeMyAssignedTaskRow(row);
    if (normalized) tasks.push(normalized);
  }

  const users = (usersResult.data ?? []) as BoardDirectoryUser[];

  return {
    ok: true,
    data: {
      tasks,
      users,
      session: {
        userId: authUser.id,
        isAdmin: profileResult.data.role === "admin",
      },
    },
  };
}
