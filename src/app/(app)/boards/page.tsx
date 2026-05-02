import { BoardsList } from "@/components/boards/boards-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boards",
};

export default function BoardsPage() {
  return <BoardsList />;
}
