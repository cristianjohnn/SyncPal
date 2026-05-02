/** Pure helpers for displaying activity_log rows (safe for server components). */

export function getActivityMessage(action: string, entityType: string): string {
  const messages: Record<string, Record<string, string>> = {
    created: {
      board: "created a new board",
      task: "created a new task",
      branch: "created a new branch",
    },
    updated: {
      board: "updated a board",
      task: "updated a task",
      branch: "updated a branch",
    },
    deleted: {
      board: "deleted a board",
      task: "deleted a task",
      branch: "deleted a branch",
    },
    status_changed: {
      task: "changed task status",
      branch: "changed branch status",
    },
    merged: {
      branch: "merged a branch",
    },
    assigned: {
      task: "assigned a task",
    },
    moved: {
      task: "moved a task",
    },
    commented: {
      task: "commented on a task",
      branch: "commented on a branch",
    },
  };

  return messages[action]?.[entityType] ?? `${action.replace(/_/g, " ")} (${entityType})`;
}
