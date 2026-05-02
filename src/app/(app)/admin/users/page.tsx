import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminUsers } from "@/components/admin/admin-users";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check admin role
  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user?.id || "")
    .single();

  if (currentUser?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminUsers users={users || []} currentUserId={user?.id || ""} />;
}
