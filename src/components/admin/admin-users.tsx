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
import { Button } from "@/components/ui/button";
import { Users, Shield, UserIcon, Trash2 } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { updateUserRole, removeUser } from "@/app/(app)/admin/actions";
import type { UserRole } from "@/types/database";

interface AdminUsersProps {
  users: Array<{
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    avatar_url: string | null;
    created_at: string;
  }>;
  currentUserId: string;
  isAdmin: boolean;
}

export function AdminUsers({ users: initialUsers, currentUserId, isAdmin }: AdminUsersProps) {
  const [users, setUsers] = useState(initialUsers);

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (userId === currentUserId) {
      toast.error("You cannot change your own role");
      return;
    }

    const result = await updateUserRole(userId, newRole);
    
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.success(`Role updated to ${newRole}`);
  };

  const handleRemoveUser = async (userId: string) => {
    if (userId === currentUserId) {
      toast.error("You cannot remove your own account");
      return;
    }

    const result = await removeUser(userId);
    
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.success("User removed successfully");
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
                <TableHead>Actions</TableHead>
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
                        {user.id === currentUserId && (
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
                    —
                  </TableCell>
                  <TableCell>
                    {user.id === currentUserId ? (
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
                  <TableCell>
                    {user.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(user.id)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
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
