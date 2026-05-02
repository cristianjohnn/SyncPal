import { createClient } from "@/lib/supabase/client";

type EntityType = "board" | "task" | "branch" | "user";

interface LogActivityParams {
  action: string;
  entityType: EntityType;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity({
  action,
  entityType,
  entityId,
  metadata,
}: LogActivityParams) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("activity_log").insert({
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: metadata || null,
  });
}

export function getActivityMessage(action: string, entityType: string): string {
  const messages: Record<string, Record<string, string>> = {
    created: {
      board: "created a new board",
      task: "created a new task",
      branch: "created a new branch",
    },
    updated: {
      board: "updated a board",
      task: "updated a task",
      branch: "updated a branch",
    },
    deleted: {
      board: "deleted a board",
      task: "deleted a task",
      branch: "deleted a branch",
    },
    status_changed: {
      task: "changed task status",
      branch: "changed branch status",
    },
    assigned: {
      task: "assigned a task",
    },
    moved: {
      task: "moved a task",
    },
  };

  return messages[action]?.[entityType] || `${action} a ${entityType}`;
}
