import { MyTasks } from "@/components/tasks/my-tasks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Tasks",
};

export default function TasksPage() {
  return <MyTasks />;
}
