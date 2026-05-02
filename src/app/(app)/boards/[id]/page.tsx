import { KanbanBoard } from "@/components/boards/kanban-board";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Board",
};

export default function BoardPage() {
  return <KanbanBoard />;
}
