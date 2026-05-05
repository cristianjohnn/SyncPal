import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@/types/database";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get the authenticated user from Supabase Auth
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("[AppLayout] getUser result:", {
    hasUser: !!authUser,
    userId: authUser?.id ?? "none",
    authError: authError?.message ?? "none",
  });

  if (!authUser) {
    console.log("[AppLayout] No auth user → redirecting to /login");
    redirect("/login");
  }

  // Fetch the full user profile from the users table
  let { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  console.log("[AppLayout] Profile query result:", {
    hasProfile: !!profile,
    profileError: profileError?.message ?? "none",
    profileCode: profileError?.code ?? "none",
  });

  // If profile doesn't exist, create it on-the-fly
  // This prevents a redirect loop when the callback's insert fails or
  // when user exists in auth but not in the users table
  if (!profile) {
    console.log("[AppLayout] Profile missing → creating profile for", authUser.id);
    const { data: newProfile, error: insertError } = await supabase
      .from("users")
      .upsert({
        id: authUser.id,
        full_name:
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.email?.split("@")[0] ||
          "User",
        email: authUser.email!,
        role: "user",
        avatar_url: authUser.user_metadata?.avatar_url || null,
      })
      .select("*")
      .single();

    console.log("[AppLayout] Profile upsert result:", {
      success: !!newProfile,
      insertError: insertError?.message ?? "none",
    });

    if (newProfile) {
      profile = newProfile;
    } else {
      // Only redirect to login if we truly can't create a profile
      // Sign the user out first to prevent the redirect loop
      console.log("[AppLayout] Cannot create profile → signing out and redirecting");
      await supabase.auth.signOut();
      redirect("/login?error=profile_creation_failed");
    }
  }

  const user: User = profile;

  return <AppShell user={user}>{children}</AppShell>;
}
