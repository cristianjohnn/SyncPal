import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user?.id || "")
    .single();

  // Check if user signed up with email/password
  const isEmailUser = user?.app_metadata?.provider === "email";

  return (
    <SettingsForm
      profile={profile}
      isEmailUser={isEmailUser}
    />
  );
}
