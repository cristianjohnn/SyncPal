"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  User as UserIcon,
  Palette,
  Bell,
  Building2,
  Lock,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types/database";
import type { TeamMember } from "@/lib/queries/settings";
import { updateProfile, changePassword } from "@/app/(app)/settings/actions";
import { getInitials } from "@/lib/utils";

function roleLabel(role: User["role"]): string {
  return role === "admin" ? "Admin" : "Member";
}

interface SettingsFormProps {
  profile: User;
  teamMembers: TeamMember[];
}

export function SettingsForm({ profile, teamMembers }: SettingsFormProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState(profile.full_name);
  const [designation, setDesignation] = useState(profile.designation ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setFullName(profile.full_name);
    setDesignation(profile.designation ?? "");
    setAvatarUrl(profile.avatar_url ?? "");
  }, [profile.id, profile.full_name, profile.designation, profile.avatar_url]);

  const profileDirty = useMemo(() => {
    const nextDesig = designation.trim() || null;
    const prevDesig = profile.designation ?? null;
    const nextAv = avatarUrl.trim() || null;
    const prevAv = profile.avatar_url ?? null;
    return (
      fullName.trim() !== profile.full_name.trim() ||
      nextDesig !== prevDesig ||
      nextAv !== prevAv
    );
  }, [
    fullName,
    designation,
    avatarUrl,
    profile.full_name,
    profile.designation,
    profile.avatar_url,
  ]);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }

    setSavingProfile(true);
    const result = await updateProfile({
      full_name: fullName.trim(),
      designation: designation.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    });
    setSavingProfile(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Profile updated");
    router.refresh();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setChangingPassword(true);
    const result = await changePassword({ newPassword });
    setChangingPassword(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Password updated");
    setNewPassword("");
    setConfirmPassword("");
  };

  const avatarPreview =
    avatarUrl.trim() || profile.avatar_url || undefined;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, preferences, and workspace
        </p>
      </div>

      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Profile</CardTitle>
          </div>
          <CardDescription>
            Update your personal information and avatar image URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={avatarPreview} />
              <AvatarFallback className="text-lg">
                {getInitials(fullName.trim() || profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label htmlFor="settingsAvatarUrl">Avatar URL</Label>
              <Input
                id="settingsAvatarUrl"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste a direct image URL. File uploads can be added later with
                Supabase Storage.
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Role</span>
            <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
              {roleLabel(profile.role)}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settingsName">Full Name</Label>
              <Input
                id="settingsName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settingsEmail">Email</Label>
              <Input
                id="settingsEmail"
                value={profile.email}
                disabled
                className="opacity-60"
              />
              <p className="text-[10px] text-muted-foreground">
                Email is tied to your login account
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="settingsDesignation">Designation</Label>
              <Input
                id="settingsDesignation"
                placeholder="e.g., Frontend Developer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={handleSaveProfile}
            disabled={savingProfile || !profileDirty}
            className="gap-1.5"
          >
            {savingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      <Card className="animate-fade-in" style={{ animationDelay: "80ms" }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Password</CardTitle>
          </div>
          <CardDescription>
            Signed-in users can set a new password without the old one (Supabase
            Auth).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              disabled={
                changingPassword ||
                !newPassword ||
                newPassword !== confirmPassword
              }
              className="gap-1.5"
            >
              {changingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="animate-fade-in" style={{ animationDelay: "120ms" }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Preferences</CardTitle>
          </div>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" /> Theme
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Choose between light, dark, or system theme
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in" style={{ animationDelay: "160ms" }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Workspace</CardTitle>
          </div>
          <CardDescription>
            People in your organization (from profiles)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-medium">Team members</h4>
              {profile.role === "admin" ? (
                <Link
                  href="/admin/users"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Manage users
                </Link>
              ) : null}
            </div>
            <div className="rounded-md border">
              {teamMembers.map((member, i) => (
                <div
                  key={member.id}
                  className={
                    "flex items-center justify-between p-3 gap-3 " +
                    (i !== teamMembers.length - 1 ? "border-b " : "")
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={member.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(member.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={
                      "text-xs px-2 py-1 rounded-full shrink-0 " +
                      (member.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground")
                    }
                  >
                    {roleLabel(member.role)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Billing</h4>
            <p className="text-sm text-muted-foreground">
              Billing is not configured for this workspace yet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
