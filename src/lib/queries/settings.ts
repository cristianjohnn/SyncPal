import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";

export type TeamMember = Pick<
  User,
  "id" | "full_name" | "email" | "role" | "avatar_url"
>;

export interface SettingsPageData {
  profile: User;
  teamMembers: TeamMember[];
}

export async function fetchSettingsPageData(): Promise<
  | { ok: true; data: SettingsPageData }
  | { ok: false; error: string }
> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { ok: false, error: "Not authenticated." };
  }

  const [profileResult, teamResult] = await Promise.all([
    supabase.from("users").select("*").eq("id", authUser.id).single(),
    supabase
      .from("users")
      .select("id, full_name, email, role, avatar_url")
      .order("full_name", { ascending: true }),
  ]);

  if (profileResult.error || !profileResult.data) {
    return {
      ok: false,
      error: profileResult.error?.message ?? "Could not load your profile.",
    };
  }

  if (teamResult.error) {
    return { ok: false, error: teamResult.error.message };
  }

  return {
    ok: true,
    data: {
      profile: profileResult.data as User,
      teamMembers: (teamResult.data ?? []) as TeamMember[],
    },
  };
}
