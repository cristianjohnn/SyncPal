import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";

export type AdminUser = Pick<
  User,
  "id" | "full_name" | "email" | "role" | "avatar_url" | "created_at"
>;

export interface AdminPageData {
  users: AdminUser[];
  currentUserId: string;
  isAdmin: boolean;
}

export async function fetchAdminUsersPageData(): Promise<
  | { ok: true; data: AdminPageData }
  | { ok: false; error: string }
> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { ok: false, error: "Not authenticated." };
  }

  // Check if current user is admin
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", authUser.id)
    .single();

  if (profileError || !profile) {
    return {
      ok: false,
      error: profileError?.message ?? "Could not verify admin access.",
    };
  }

  if (profile.role !== "admin") {
    return { ok: false, error: "Access denied. Admin role required." };
  }

  // Fetch all workspace users
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, full_name, email, role, avatar_url, created_at")
    .order("created_at", { ascending: false });

  if (usersError) {
    return { ok: false, error: usersError.message };
  }

  return {
    ok: true,
    data: {
      users: (users ?? []) as AdminUser[],
      currentUserId: authUser.id,
      isAdmin: profile.role === "admin",
    },
  };
}
