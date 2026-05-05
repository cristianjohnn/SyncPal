import { MyTasks } from "@/components/tasks/my-tasks";
import { fetchMyTasksPageData } from "@/lib/queries/tasks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Tasks",
};

export default async function TasksPage() {
  const result = await fetchMyTasksPageData();

  if (!result.ok) {
    return (
      <div className="max-w-lg mx-auto rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
        <h1 className="text-lg font-semibold text-destructive">
          Could not load tasks
        </h1>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  const { tasks, users, session } = result.data;

  return (
    <MyTasks initialTasks={tasks} users={users} session={session} />
  );
}
