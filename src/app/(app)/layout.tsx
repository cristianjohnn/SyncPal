import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@/types/database";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user: User = {
    id: "u1",
    full_name: "Alex Developer",
    email: "alex@synqr.app",
    role: "admin",
    designation: "Frontend Engineer",
    avatar_url: "https://avatar.vercel.sh/alex",
    created_at: new Date().toISOString(),
  };

  return <AppShell user={user}>{children}</AppShell>;
}
