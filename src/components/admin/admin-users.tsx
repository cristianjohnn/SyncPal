"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, UserIcon } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { User, UserRole } from "@/types/database";

const MOCK_USERS: User[] = [
  {
    id: "u1",
    full_name: "Alex Developer",
    email: "alex@synqr.app",
    role: "admin",
    designation: "Frontend Engineer",
    avatar_url: "https://avatar.vercel.sh/alex",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "u2",
    full_name: "Sarah Chen",
    email: "sarah@synqr.app",
    role: "user",
    designation: "Product Designer",
    avatar_url: "https://avatar.vercel.sh/sarah",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "u3",
    full_name: "Mike Johnson",
    email: "mike@synqr.app",
    role: "user",
    designation: "Backend Developer",
    avatar_url: "https://avatar.vercel.sh/mike",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  }
];

const CURRENT_USER_ID = "u1";

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (userId === CURRENT_USER_ID) {
      toast.error("You cannot change your own role");
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.success(`Role updated to ${newRole}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage team members and their roles
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in stagger-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admins
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in stagger-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Members
            </CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users table */}
      <Card className="animate-fade-in stagger-3">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.full_name}</p>
                        {user.id === CURRENT_USER_ID && (
                          <span className="text-[10px] text-muted-foreground">
                            (You)
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.designation || "—"}
                  </TableCell>
                  <TableCell>
                    {user.id === CURRENT_USER_ID ? (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary text-xs"
                      >
                        {user.role}
                      </Badge>
                    ) : (
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          value && handleRoleChange(user.id, value as UserRole)
                        }
                      >
                        <SelectTrigger className="w-24 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">admin</SelectItem>
                          <SelectItem value="user">user</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
