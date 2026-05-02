import { redirect } from "next/navigation";
import { AdminUsers } from "@/components/admin/admin-users";
import { fetchAdminUsersPageData } from "@/lib/queries/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
};

export default async function AdminUsersPage() {
  const result = await fetchAdminUsersPageData();

  if (!result.ok) {
    // If not admin, redirect to dashboard
    if (result.error.includes("Access denied") || result.error.includes("Admin role required")) {
      redirect("/dashboard");
    }
    
    return (
      <div className="max-w-lg mx-auto rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
        <h1 className="text-lg font-semibold text-destructive">
          Could not load admin data
        </h1>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  const { users, currentUserId, isAdmin } = result.data;

  return <AdminUsers users={users} currentUserId={currentUserId} isAdmin={isAdmin} />;
}
