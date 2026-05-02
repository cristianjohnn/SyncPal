"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Kanban, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity";
import { getInitials, getStatusColor } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";

interface BoardsListProps {
  boards: Array<{
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    creator?: { id: string; full_name: string; avatar_url: string | null } | null;
    tasks?: Array<{ id: string; status: string }>;
  }>;
  users: Array<{ id: string; full_name: string; avatar_url: string | null }>;
}

export function BoardsList({ boards: initialBoards, users }: BoardsListProps) {
  const router = useRouter();
  const [boards, setBoards] = useState(initialBoards);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newBoard, setNewBoard] = useState({ name: "", description: "" });

  const filteredBoards = boards.filter((board) =>
    board.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newBoard.name.trim()) {
      toast.error("Board name is required");
      return;
    }
    setCreating(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("boards")
        .insert({
          name: newBoard.name.trim(),
          description: newBoard.description.trim() || null,
          created_by: user?.id,
        })
        .select("*, creator:users!boards_created_by_fkey(id, full_name, avatar_url)")
        .single();

      if (error) throw error;
      if (data) {
        setBoards([{ ...data, tasks: [] }, ...boards]);
        await logActivity({
          action: "created",
          entityType: "board",
          entityId: data.id,
          metadata: { name: data.name },
        });
        toast.success("Board created!");
      }
      setNewBoard({ name: "", description: "" });
      setDialogOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to create board");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Boards</h1>
          <p className="text-muted-foreground mt-1">
            Manage your project boards and track progress
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="gap-2 shadow-sm" />}>
            <Plus className="h-4 w-4" />
            New Board
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="boardName">Board Name</Label>
                <Input
                  id="boardName"
                  placeholder="e.g., Sprint 1"
                  value={newBoard.name}
                  onChange={(e) =>
                    setNewBoard({ ...newBoard, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boardDesc">Description (optional)</Label>
                <Textarea
                  id="boardDesc"
                  placeholder="Describe the board's purpose..."
                  value={newBoard.description}
                  onChange={(e) =>
                    setNewBoard({ ...newBoard, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="w-full"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Board
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search boards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Board grid */}
      {filteredBoards.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title={search ? "No boards found" : "No boards yet"}
          description={
            search
              ? "Try a different search term"
              : "Create your first board to start organizing tasks"
          }
          actionLabel={!search ? "Create Board" : undefined}
          onAction={!search ? () => setDialogOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBoards.map((board, index) => {
            const total = board.tasks?.length || 0;
            const done = board.tasks?.filter((t) => t.status === "done").length || 0;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <Link key={board.id} href={`/boards/${board.id}`}>
                <Card
                  className="hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group animate-fade-in h-full"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        {board.name}
                      </CardTitle>
                      {board.creator && (
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarImage src={board.creator.avatar_url || undefined} />
                          <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                            {getInitials(board.creator.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    {board.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {board.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap mb-3">
                      <Badge variant="secondary" className="text-[10px]">
                        {total} tasks
                      </Badge>
                      {done > 0 && (
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${getStatusColor("done")}`}
                        >
                          {done} done
                        </Badge>
                      )}
                    </div>
                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
