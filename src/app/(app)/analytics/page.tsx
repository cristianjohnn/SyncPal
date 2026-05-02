import { AnalyticsPage } from "@/components/analytics/analytics-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AnalyticsRoute() {
  return <AnalyticsPage />;
}
