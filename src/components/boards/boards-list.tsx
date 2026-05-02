"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Plus, Search, Kanban } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";

// Mock Data
const MOCK_BOARDS = [
  {
    id: "1",
    name: "Frontend Redesign",
    description: "Complete overhaul of the user interface using Tailwind v4.",
    tasks: { todo: 4, in_progress: 2, review: 1, done: 15 },
    creator: { full_name: "Alex Developer", avatar_url: "https://avatar.vercel.sh/alex" }
  },
  {
    id: "2",
    name: "API V2 Migration",
    description: "Migrating REST endpoints to GraphQL.",
    tasks: { todo: 12, in_progress: 4, review: 3, done: 2 },
    creator: { full_name: "Sarah Chen", avatar_url: "https://avatar.vercel.sh/sarah" }
  },
  {
    id: "3",
    name: "Q3 Marketing Launch",
    description: "Tasks for the upcoming product hunt launch.",
    tasks: { todo: 2, in_progress: 5, review: 2, done: 8 },
    creator: { full_name: "Emily Davis", avatar_url: "https://avatar.vercel.sh/emily" }
  }
];

export function BoardsList() {
  const [boards, setBoards] = useState(MOCK_BOARDS);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBoard, setNewBoard] = useState({ name: "", description: "" });

  const filteredBoards = boards.filter((board) =>
    board.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoard.name.trim()) {
      toast.error("Board name is required");
      return;
    }
    
    const createdBoard = {
      id: Math.random().toString(),
      name: newBoard.name.trim(),
      description: newBoard.description.trim(),
      tasks: { todo: 0, in_progress: 0, review: 0, done: 0 },
      creator: { full_name: "Alex Developer", avatar_url: "https://avatar.vercel.sh/alex" }
    };
    
    setBoards([createdBoard, ...boards]);
    toast.success("Board created successfully!");
    setNewBoard({ name: "", description: "" });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in relative pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Boards</h1>
          <p className="text-muted-foreground mt-1">
            Manage your project boards and track progress
          </p>
        </div>
        <div className="relative max-w-sm w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search boards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Board grid */}
      {filteredBoards.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title={search ? "No boards found" : "No boards yet"}
          description={
            search
              ? "Try a different search term"
              : "Create your first board to start organizing tasks."
          }
          actionLabel={!search ? "Create Board" : undefined}
          onAction={!search ? () => setDialogOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredBoards.map((board, index) => {
            const total = board.tasks.todo + board.tasks.in_progress + board.tasks.review + board.tasks.done;

            return (
              <Card
                key={board.id}
                className="hover:shadow-lg hover:border-primary/50 transition-all duration-300 group flex flex-col h-full bg-card"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3 flex-1">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {board.name}
                    </CardTitle>
                    <Avatar className="h-8 w-8 shrink-0 border border-border">
                      <AvatarImage src={board.creator.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {board.creator.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {board.description && (
                    <CardDescription className="line-clamp-2 mt-2">
                      {board.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap mb-6">
                    <Badge variant="secondary" className="bg-muted/50 text-xs">
                      {total} tasks
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 text-xs">
                      {board.tasks.todo} todo
                    </Badge>
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 text-xs">
                      {board.tasks.in_progress} active
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 text-xs">
                      {board.tasks.review} review
                    </Badge>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 text-xs">
                      {board.tasks.done} done
                    </Badge>
                  </div>
                  
                  <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                    <Link href={`/boards/${board.id}`} className={buttonVariants({ className: "w-full" })}>
                      Open Board
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger render={
          <Button
            size="icon"
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl hover:scale-105 transition-transform bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-6 w-6" />
          </Button>
        } />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="boardName">Board Name</Label>
              <Input
                id="boardName"
                placeholder="e.g., Sprint 1"
                value={newBoard.name}
                onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="boardDesc">Description (optional)</Label>
              <Textarea
                id="boardDesc"
                placeholder="Describe the board's purpose..."
                value={newBoard.description}
                onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Board</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
