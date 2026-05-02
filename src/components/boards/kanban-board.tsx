"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity";
import { TaskCard } from "@/components/boards/task-card";
import { TaskDialog } from "@/components/boards/task-dialog";
import { toast } from "sonner";
import Link from "next/link";
import type { Board, TaskStatus, TaskPriority } from "@/types/database";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "bg-slate-500" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { id: "review", label: "Review", color: "bg-amber-500" },
  { id: "done", label: "Done", color: "bg-emerald-500" },
];

interface TaskWithRelations {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  board_id: string;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  assignee?: { id: string; full_name: string; avatar_url: string | null } | null;
  branches?: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

interface KanbanBoardProps {
  board: Board;
  tasks: TaskWithRelations[];
  users: Array<{
    id: string;
    full_name: string;
    avatar_url: string | null;
    email: string;
  }>;
  isAdmin: boolean;
}

export function KanbanBoard({
  board,
  tasks: initialTasks,
  users,
  isAdmin,
}: KanbanBoardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createColumn, setCreateColumn] = useState<TaskStatus>("todo");
  const [creating, setCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    assigned_to: "",
  });

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => tasks.filter((t) => t.status === status),
    [tasks]
  );

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newStatus = destination.droppableId as TaskStatus;
    const taskId = draggableId;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", taskId);

      if (error) throw error;

      await logActivity({
        action: "status_changed",
        entityType: "task",
        entityId: taskId,
        metadata: { from: source.droppableId, to: newStatus },
      });
    } catch {
      // Revert on error
      setTasks(initialTasks);
      toast.error("Failed to update task status");
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    setCreating(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: newTask.title.trim(),
          description: newTask.description.trim() || null,
          status: createColumn,
          priority: newTask.priority,
          board_id: board.id,
          assigned_to: newTask.assigned_to || null,
          created_by: user?.id,
        })
        .select("*, assignee:users!tasks_assigned_to_fkey(id, full_name, avatar_url)")
        .single();

      if (error) throw error;
      if (data) {
        setTasks((prev) => [...prev, { ...data, branches: [] }]);
        await logActivity({
          action: "created",
          entityType: "task",
          entityId: data.id,
          metadata: { title: data.title, board: board.name },
        });
        toast.success("Task created!");
      }
      setNewTask({ title: "", description: "", priority: "medium", assigned_to: "" });
      setCreateDialogOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleTaskUpdate = (updatedTask: TaskWithRelations) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setTaskDialogOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Board header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/boards">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{board.name}</h1>
            {board.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {board.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {tasks.length} tasks
          </Badge>
        </div>
      </div>

      {/* Kanban columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-[300px] flex flex-col"
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
                    <h3 className="text-sm font-semibold">{column.label}</h3>
                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {columnTasks.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setCreateColumn(column.id);
                      setCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Droppable column */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-xl border-2 border-dashed p-2 min-h-[200px] space-y-2 transition-colors ${
                        snapshot.isDraggingOver
                          ? "kanban-drop-active border-primary/30"
                          : "border-transparent bg-muted/30"
                      }`}
                    >
                      <ScrollArea className="h-[calc(100vh-320px)]">
                        <div className="space-y-2 pr-2">
                          {columnTasks.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setTaskDialogOpen(true);
                                  }}
                                >
                                  <TaskCard
                                    task={task}
                                    isDragging={snapshot.isDragging}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Create task dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Title</Label>
              <Input
                id="taskTitle"
                placeholder="Enter task title..."
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskDesc">Description</Label>
              <Textarea
                id="taskDesc"
                placeholder="Describe the task..."
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    value && setNewTask({ ...newTask, priority: value as TaskPriority })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assign to</Label>
                <Select
                  value={newTask.assigned_to}
                  onValueChange={(value) =>
                    value && setNewTask({ ...newTask, assigned_to: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleCreateTask}
              disabled={creating}
              className="w-full"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task detail dialog */}
      {selectedTask && (
        <TaskDialog
          task={selectedTask}
          users={users}
          isAdmin={isAdmin}
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  );
}
