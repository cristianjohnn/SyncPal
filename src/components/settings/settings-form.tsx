"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, User as UserIcon, Palette, Bell, Building2, CreditCard, Upload } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MOCK_TEAM = [
  { id: "1", name: "Alex Developer", email: "alex@synqr.app", role: "Admin" },
  { id: "2", name: "Sarah Chen", email: "sarah@synqr.app", role: "Member" },
  { id: "3", name: "Mike Johnson", email: "mike@synqr.app", role: "Member" },
];

export function SettingsForm() {
  const [fullName, setFullName] = useState("Alex Developer");
  const [designation, setDesignation] = useState("Frontend Engineer");
  const [email] = useState("alex@synqr.app");
  const [savingProfile, setSavingProfile] = useState(false);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [mentionsOnly, setMentionsOnly] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Name is required");
      return;
    }
    setSavingProfile(true);
    setTimeout(() => {
      toast.success("Profile updated!");
      setSavingProfile(false);
    }, 800);
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    setTimeout(() => {
      toast.success("Preferences saved!");
      setSavingPrefs(false);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, preferences, and workspace
        </p>
      </div>

      {/* Profile */}
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Profile</CardTitle>
          </div>
          <CardDescription>Update your personal information and avatar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src="https://avatar.vercel.sh/alex" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload New
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, GIF or PNG. 1MB max.
              </p>
            </div>
          </div>
          <Separator />
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
                value={email}
                disabled
                className="opacity-60"
              />
              <p className="text-[10px] text-muted-foreground">Email cannot be changed</p>
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
            onClick={handleSaveProfile}
            disabled={savingProfile}
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

      {/* Preferences */}
      <Card className="animate-fade-in" style={{ animationDelay: "100ms" }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Preferences</CardTitle>
          </div>
          <CardDescription>Customize your experience and notifications</CardDescription>
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
          <Separator />
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notifications</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifs" className="font-medium cursor-pointer">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive daily summaries and important updates via email</p>
              </div>
              <input 
                type="checkbox" 
                id="email-notifs" 
                checked={emailNotifs} 
                onChange={(e) => setEmailNotifs(e.target.checked)} 
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifs" className="font-medium cursor-pointer">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive real-time alerts on your device</p>
              </div>
              <input 
                type="checkbox" 
                id="push-notifs" 
                checked={pushNotifs} 
                onChange={(e) => setPushNotifs(e.target.checked)} 
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mentions-only" className="font-medium cursor-pointer">Only Mentions</Label>
                <p className="text-xs text-muted-foreground">Only notify me when someone @mentions me</p>
              </div>
              <input 
                type="checkbox" 
                id="mentions-only" 
                checked={mentionsOnly} 
                onChange={(e) => setMentionsOnly(e.target.checked)} 
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          </div>

          <Button
            onClick={handleSavePreferences}
            disabled={savingPrefs}
            variant="outline"
            className="gap-1.5"
          >
            {savingPrefs ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Workspace Settings */}
      <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Workspace Settings</CardTitle>
          </div>
          <CardDescription>Manage your team and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Team Members</h4>
              <Button variant="outline" size="sm">Invite Member</Button>
            </div>
            <div className="rounded-md border">
              {MOCK_TEAM.map((member, i) => (
                <div key={member.id} className={"flex items-center justify-between p-3 " + (i !== MOCK_TEAM.length - 1 ? 'border-b' : '')}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={"https://avatar.vercel.sh/" + member.name} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <span className={"text-xs px-2 py-1 rounded-full " + (member.role === 'Admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Billing
            </h4>
            <div className="bg-muted/50 rounded-lg p-4 border border-border flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Pro Plan</p>
                <p className="text-xs text-muted-foreground mt-1">$12/mo per user. Renews on Oct 1, 2024.</p>
              </div>
              <Button variant="secondary" size="sm">Manage Plan</Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
