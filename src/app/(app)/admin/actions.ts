"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export type AdminActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<AdminActionResult<UserRole>> {
  if (!userId || !newRole) {
    return { ok: false, error: "User ID and role are required." };
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { ok: false, error: "Not authenticated." };
  }

  // Prevent changing own role
  if (userId === authUser.id) {
    return { ok: false, error: "You cannot change your own role." };
  }

  // Verify current user is admin
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

  // Update user role
  const { data, error } = await supabase
    .from("users")
    .update({ role: newRole })
    .eq("id", userId)
    .select("role")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "Failed to update user role.",
    };
  }

  revalidatePath("/admin/users");
  return { ok: true, data: data.role as UserRole };
}

export async function removeUser(
  userId: string
): Promise<AdminActionResult<{ userId: string }>> {
  if (!userId) {
    return { ok: false, error: "User ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { ok: false, error: "Not authenticated." };
  }

  // Prevent removing self
  if (userId === authUser.id) {
    return { ok: false, error: "You cannot remove your own account." };
  }

  // Verify current user is admin
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

  // Delete user profile (this will cascade due to foreign key constraints)
  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    return {
      ok: false,
      error: error?.message ?? "Failed to remove user.",
    };
  }

  revalidatePath("/admin/users");
  return { ok: true, data: { userId } };
}
