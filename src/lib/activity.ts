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

export { getActivityMessage } from "@/lib/activity-format";
