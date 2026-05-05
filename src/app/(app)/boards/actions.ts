"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeKanbanTaskRow,
  type KanbanTask,
} from "@/lib/queries/boards";
import type { TaskPriority, TaskStatus } from "@/types/database";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function createBoard(input: {
  name: string;
  description?: string | null;
}): Promise<ActionResult<{ id: string; name: string; description: string | null }>> {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Board name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("boards")
    .insert({
      name,
      description: input.description?.trim() || null,
      created_by: user.id,
    })
    .select("id, name, description")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Failed to create board." };
  }

  revalidatePath("/boards");
  return { ok: true, data };
}

export async function createTask(input: {
  board_id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: string | null;
}): Promise<ActionResult<KanbanTask>> {
  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Task title is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      board_id: input.board_id,
      title,
      description: input.description?.trim() || null,
      status: input.status,
      priority: input.priority,
      assigned_to: input.assigned_to || null,
      created_by: user.id,
    })
    .select(
      `
      *,
      assignee:users!tasks_assigned_to_fkey(id, full_name, avatar_url),
      branches(*)
    `
    )
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Failed to create task." };
  }

  const normalized = normalizeKanbanTaskRow(data);
  if (!normalized) {
    return { ok: false, error: "Could not load created task." };
  }

  revalidatePath("/boards");
  revalidatePath(`/boards/${input.board_id}`);
  revalidatePath("/tasks");
  return { ok: true, data: normalized };
}

export async function updateTask(input: {
  board_id: string;
  id: string;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string | null;
}): Promise<ActionResult<KanbanTask>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) {
    const t = input.title.trim();
    if (!t) {
      return { ok: false, error: "Title cannot be empty." };
    }
    patch.title = t;
  }
  if (input.description !== undefined) {
    patch.description =
      input.description === null ? null : input.description.trim() || null;
  }
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.assigned_to !== undefined) patch.assigned_to = input.assigned_to;

  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "Nothing to update." };
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", input.id)
    .eq("board_id", input.board_id)
    .select(
      `
      *,
      assignee:users!tasks_assigned_to_fkey(id, full_name, avatar_url),
      branches(*)
    `
    )
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Failed to update task." };
  }

  const normalized = normalizeKanbanTaskRow(data);
  if (!normalized) {
    return { ok: false, error: "Could not load updated task." };
  }

  revalidatePath("/boards");
  revalidatePath(`/boards/${input.board_id}`);
  revalidatePath("/tasks");
  return { ok: true, data: normalized };
}

export async function deleteTask(input: {
  board_id: string;
  id: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", input.id)
    .eq("board_id", input.board_id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/boards");
  revalidatePath(`/boards/${input.board_id}`);
  revalidatePath("/tasks");
  return { ok: true, data: { id: input.id } };
}
