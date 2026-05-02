"use client";

import { useCallback, useState } from "react";
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
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { TaskCard } from "@/components/boards/task-card";
import { TaskDialog } from "@/components/boards/task-dialog";
import { toast } from "sonner";
import Link from "next/link";
import type { TaskStatus, TaskPriority, Board } from "@/types/database";
import type {
  BoardDirectoryUser,
  KanbanPageSession,
  KanbanTask,
} from "@/lib/queries/boards";
import { createTask, updateTask } from "@/app/(app)/boards/actions";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "bg-slate-500" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { id: "review", label: "Review", color: "bg-amber-500" },
  { id: "done", label: "Done", color: "bg-emerald-500" },
];

const COLUMN_ORDER: TaskStatus[] = COLUMNS.map((c) => c.id);

function reorderFlat(tasks: KanbanTask[]): KanbanTask[] {
  return COLUMN_ORDER.flatMap((col) =>
    tasks.filter((t) => t.status === col)
  );
}

interface KanbanBoardProps {
  board: Board;
  initialTasks: KanbanTask[];
  users: BoardDirectoryUser[];
  session: KanbanPageSession;
}

export function KanbanBoard({
  board,
  initialTasks,
  users,
  session,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<KanbanTask[]>(() =>
    reorderFlat(initialTasks)
  );
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createColumn, setCreateColumn] = useState<TaskStatus>("todo");
  const [creatingTask, setCreatingTask] = useState(false);
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

    const sourceCol = source.droppableId as TaskStatus;
    const destCol = destination.droppableId as TaskStatus;
    const taskId = draggableId;

    if (
      sourceCol === destCol &&
      destination.index === source.index
    ) {
      return;
    }

    if (sourceCol === destCol) {
      setTasks((prev) => {
        const colTasks = prev.filter((t) => t.status === sourceCol);
        const others = prev.filter((t) => t.status !== sourceCol);
        const reordered = [...colTasks];
        const [removed] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, removed);
        return reorderFlat([...others, ...reordered]);
      });
      return;
    }

    const previous = tasks;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prev) => {
      const rest = prev.filter((t) => t.id !== taskId);
      const destTasks = rest.filter((t) => t.status === destCol);
      const others = rest.filter((t) => t.status !== destCol);
      const moved: KanbanTask = { ...task, status: destCol };
      const newDest = [
        ...destTasks.slice(0, destination.index),
        moved,
        ...destTasks.slice(destination.index),
      ];
      return reorderFlat([...others, ...newDest]);
    });

    setSelectedTask((prev) =>
      prev?.id === taskId ? { ...prev, status: destCol } : prev
    );

    const apiResult = await updateTask({
      board_id: board.id,
      id: taskId,
      status: destCol,
    });

    if (!apiResult.ok) {
      setTasks(reorderFlat(previous));
      setSelectedTask((prev) =>
        prev?.id === taskId ? { ...prev, status: task.status } : prev
      );
      toast.error(apiResult.error);
      return;
    }

    setTasks((prev) =>
      reorderFlat(
        prev.map((t) => (t.id === taskId ? apiResult.data : t))
      )
    );
    setSelectedTask((prev) =>
      prev?.id === taskId ? apiResult.data : prev
    );
    toast.success("Task moved");
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    setCreatingTask(true);
    const result = await createTask({
      board_id: board.id,
      title: newTask.title.trim(),
      description: newTask.description.trim() || null,
      status: createColumn,
      priority: newTask.priority,
      assigned_to: newTask.assigned_to || null,
    });
    setCreatingTask(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setTasks((prev) => reorderFlat([...prev, result.data]));
    toast.success("Task created!");
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      assigned_to: "",
    });
    setCreateDialogOpen(false);
  };

  const handleTaskUpdated = (updated: KanbanTask) => {
    setTasks((prev) =>
      reorderFlat(prev.map((t) => (t.id === updated.id ? updated : t)))
    );
    setSelectedTask(updated);
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks((prev) => reorderFlat(prev.filter((t) => t.id !== taskId)));
    setTaskDialogOpen(false);
    setSelectedTask(null);
  };

  const canDeleteSelected =
    selectedTask &&
    (session.isAdmin || selectedTask.created_by === session.userId);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Board header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/boards">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full hover:bg-muted"
            >
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
          <Badge variant="secondary" className="text-xs bg-muted/50">
            {tasks.length} tasks
          </Badge>
        </div>
      </div>

      {/* Kanban columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar flex-1 items-stretch">
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-[320px] flex flex-col rounded-xl bg-muted/20 border border-border overflow-hidden h-full"
              >
                <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
                    <h3 className="text-sm font-semibold">{column.label}</h3>
                    <Badge
                      variant="secondary"
                      className="text-xs ml-1 bg-background/50"
                    >
                      {columnTasks.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-md"
                    onClick={() => {
                      setCreateColumn(column.id);
                      setCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 transition-colors ${
                        snapshot.isDraggingOver ? "bg-primary/5" : ""
                      }`}
                    >
                      <ScrollArea className="h-full">
                        <div className="space-y-3 pb-8 min-h-[100px]">
                          {columnTasks.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(providedDrag, snapshotDrag) => (
                                <div
                                  ref={providedDrag.innerRef}
                                  {...providedDrag.draggableProps}
                                  {...providedDrag.dragHandleProps}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setTaskDialogOpen(true);
                                  }}
                                  className="group outline-none"
                                >
                                  <TaskCard
                                    task={task}
                                    isDragging={snapshotDrag.isDragging}
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

                <div className="p-2 border-t border-border/50 shrink-0">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground text-xs"
                    onClick={() => {
                      setCreateColumn(column.id);
                      setCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Add task
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Title</Label>
              <Input
                id="taskTitle"
                placeholder="Enter task title..."
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                required
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
                    value &&
                    setNewTask({
                      ...newTask,
                      priority: value as TaskPriority,
                    })
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
                  value={newTask.assigned_to || "__none__"}
                  onValueChange={(value) =>
                    value &&
                    setNewTask({
                      ...newTask,
                      assigned_to: value === "__none__" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Unassigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creatingTask}>
                {creatingTask ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating…
                  </>
                ) : (
                  "Create Task"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {selectedTask && (
        <TaskDialog
          mode="server"
          boardId={board.id}
          task={selectedTask}
          users={users}
          canDelete={!!canDeleteSelected}
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}
