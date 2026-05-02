"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/database";

export type SettingsActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const MIN_PASSWORD_LENGTH = 8;

export async function updateProfile(input: {
  full_name: string;
  designation?: string | null;
  avatar_url?: string | null;
}): Promise<SettingsActionResult<User>> {
  const full_name = input.full_name.trim();
  if (!full_name) {
    return { ok: false, error: "Full name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { ok: false, error: "Not authenticated." };
  }

  const designation =
    input.designation === undefined
      ? undefined
      : input.designation === null || input.designation.trim() === ""
        ? null
        : input.designation.trim();

  const avatar_url =
    input.avatar_url === undefined
      ? undefined
      : input.avatar_url === null || input.avatar_url.trim() === ""
        ? null
        : input.avatar_url.trim();

  const patch: Record<string, unknown> = { full_name };
  if (designation !== undefined) patch.designation = designation;
  if (avatar_url !== undefined) patch.avatar_url = avatar_url;

  const { data, error } = await supabase
    .from("users")
    .update(patch)
    .eq("id", authUser.id)
    .select("*")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "Failed to update profile.",
    };
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout");

  return { ok: true, data: data as User };
}

/** Updates password for the current session. Does not verify the previous password (Supabase behavior when already signed in). */
export async function changePassword(input: {
  newPassword: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const pw = input.newPassword;
  if (!pw || pw.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated." };
  }

  const { error } = await supabase.auth.updateUser({
    password: pw,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/settings");
  return { ok: true };
}
