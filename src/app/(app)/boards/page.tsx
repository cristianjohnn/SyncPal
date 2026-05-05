import { BoardsList } from "@/components/boards/boards-list";
import { fetchBoardsPageData } from "@/lib/queries/boards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boards",
};

export default async function BoardsPage() {
  const result = await fetchBoardsPageData();

  if (!result.ok) {
    return (
      <div className="max-w-lg mx-auto rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
        <h1 className="text-lg font-semibold text-destructive">
          Could not load boards
        </h1>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    );
  }

  return <BoardsList initialBoards={result.boards} />;
}
