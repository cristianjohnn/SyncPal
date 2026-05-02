import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { fetchDashboardPageData } from "@/lib/queries/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const result = await fetchDashboardPageData();

  if (!result.ok) {
    return (
      <div className="max-w-lg mx-auto rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
        <h1 className="text-lg font-semibold text-destructive">
          Could not load dashboard
        </h1>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  const { greetingName, pendingReviewCount, stats, activity } = result.data;

  return (
    <DashboardContent
      greetingName={greetingName}
      pendingReviewCount={pendingReviewCount}
      stats={stats}
      activity={activity}
    />
  );
}
