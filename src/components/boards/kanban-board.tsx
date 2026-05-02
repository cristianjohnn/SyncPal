"use client";

import { useState, useCallback } from "react";
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
import { Plus, ArrowLeft } from "lucide-react";
import { TaskCard } from "@/components/boards/task-card";
import { TaskDialog } from "@/components/boards/task-dialog";
import { toast } from "sonner";
import Link from "next/link";
import type { TaskStatus, TaskPriority } from "@/types/database";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "bg-slate-500" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { id: "review", label: "Review", color: "bg-amber-500" },
  { id: "done", label: "Done", color: "bg-emerald-500" },
];

const MOCK_BOARD = {
  id: "1",
  name: "Frontend Redesign",
  description: "Complete overhaul of the user interface using Tailwind v4.",
};

const MOCK_USERS = [
  { id: "u1", full_name: "Alex Developer", avatar_url: "https://avatar.vercel.sh/alex", email: "alex@example.com" },
  { id: "u2", full_name: "Sarah Chen", avatar_url: "https://avatar.vercel.sh/sarah", email: "sarah@example.com" },
];

const MOCK_TASKS = [
  {
    id: "t1",
    title: "Implement Navigation Bar",
    description: "Create the top navigation bar with user profile and search.",
    status: "done" as TaskStatus,
    priority: "high" as TaskPriority,
    board_id: "1",
    assigned_to: "u1",
    created_by: "u2",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assignee: MOCK_USERS[0],
    branches: [{ id: "b1", name: "feat/nav-bar", status: "merged" }]
  },
  {
    id: "t2",
    title: "Design System Migration",
    description: "Move all colors and fonts to globals.css.",
    status: "in_progress" as TaskStatus,
    priority: "urgent" as TaskPriority,
    board_id: "1",
    assigned_to: "u2",
    created_by: "u1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assignee: MOCK_USERS[1],
    branches: [{ id: "b2", name: "chore/design-system", status: "ongoing" }]
  },
  {
    id: "t3",
    title: "Update Auth Flow",
    description: "Use split layout for login and signup pages.",
    status: "review" as TaskStatus,
    priority: "medium" as TaskPriority,
    board_id: "1",
    assigned_to: "u1",
    created_by: "u2",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assignee: MOCK_USERS[0],
    branches: [{ id: "b3", name: "feat/auth-ui", status: "review" }]
  },
  {
    id: "t4",
    title: "Kanban Board Drag & Drop",
    description: "Implement drag and drop for task cards.",
    status: "todo" as TaskStatus,
    priority: "high" as TaskPriority,
    board_id: "1",
    assigned_to: "u1",
    created_by: "u1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assignee: MOCK_USERS[0],
    branches: []
  }
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState<any[]>(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createColumn, setCreateColumn] = useState<TaskStatus>("todo");
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

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newStatus = destination.droppableId as TaskStatus;
    const taskId = draggableId;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    toast.success("Task moved successfully!");
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    const assignee = MOCK_USERS.find(u => u.id === newTask.assigned_to);

    const createdTask = {
      id: Math.random().toString(),
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      status: createColumn,
      priority: newTask.priority,
      board_id: MOCK_BOARD.id,
      assigned_to: newTask.assigned_to || null,
      created_by: "u1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assignee: assignee || null,
      branches: []
    };

    setTasks((prev) => [...prev, createdTask]);
    toast.success("Task created!");
    setNewTask({ title: "", description: "", priority: "medium", assigned_to: "" });
    setCreateDialogOpen(false);
  };

  const handleTaskUpdate = (updatedTask: any) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setTaskDialogOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Board header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/boards">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full hover:bg-muted">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{MOCK_BOARD.name}</h1>
            {MOCK_BOARD.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {MOCK_BOARD.description}
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
                {/* Column header */}
                <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
                    <h3 className="text-sm font-semibold">{column.label}</h3>
                    <Badge variant="secondary" className="text-xs ml-1 bg-background/50">
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

                {/* Droppable column */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 transition-colors ${
                        snapshot.isDraggingOver
                          ? "bg-primary/5"
                          : ""
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
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setTaskDialogOpen(true);
                                  }}
                                  className="group outline-none"
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
                
                {/* Add task button at bottom */}
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

      {/* Create task dialog */}
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
                    {MOCK_USERS.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task detail dialog */}
      {selectedTask && (
        <TaskDialog
          task={selectedTask}
          users={MOCK_USERS}
          isAdmin={true}
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  );
}
