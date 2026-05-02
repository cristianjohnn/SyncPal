import { AdminUsers } from "@/components/admin/admin-users";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
};

export default function AdminUsersPage() {
  return <AdminUsers />;
}
