import { SettingsForm } from "@/components/settings/settings-form";
import { fetchSettingsPageData } from "@/lib/queries/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const result = await fetchSettingsPageData();

  if (!result.ok) {
    return (
      <div className="max-w-lg mx-auto rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
        <h1 className="text-lg font-semibold text-destructive">
          Could not load settings
        </h1>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  const { profile, teamMembers } = result.data;

  return <SettingsForm profile={profile} teamMembers={teamMembers} />;
}
