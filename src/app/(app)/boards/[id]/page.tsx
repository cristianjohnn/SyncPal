import { KanbanBoard } from "@/components/boards/kanban-board";
import { fetchBoardKanbanData } from "@/lib/queries/boards";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Board",
};

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await fetchBoardKanbanData(id);

  if (!result.ok) {
    if (result.notFound) {
      notFound();
    }
    return (
      <div className="max-w-lg mx-auto rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
        <h1 className="text-lg font-semibold text-destructive">
          Could not load board
        </h1>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  const { board, tasks, users, session } = result.data;

  return (
    <KanbanBoard
      key={board.id}
      board={board}
      initialTasks={tasks}
      users={users}
      session={session}
    />
  );
}
