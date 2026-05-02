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
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  const user: User | null = userProfile || {
    id: authUser.id,
    full_name:
      authUser.user_metadata?.full_name ||
      authUser.email?.split("@")[0] ||
      "User",
    email: authUser.email || "",
    role: "user" as const,
    designation: null,
    avatar_url: authUser.user_metadata?.avatar_url || null,
    created_at: authUser.created_at,
  };

  return <AppShell user={user}>{children}</AppShell>;
}
