import { NotificationsPage } from "@/components/notifications/notifications-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsRoute() {
  return <NotificationsPage />;
}
