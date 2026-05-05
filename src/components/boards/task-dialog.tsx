"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Trash2, GitBranch, Save } from "lucide-react";
import { getStatusColor, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { TaskStatus, TaskPriority } from "@/types/database";
import type { KanbanTask } from "@/lib/queries/boards";
import { deleteTask, updateTask } from "@/app/(app)/boards/actions";

interface TaskDirectoryUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
}

type TaskDialogProps =
  | {
      mode: "server";
      boardId: string;
      task: KanbanTask;
      users: TaskDirectoryUser[];
      canDelete: boolean;
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onUpdated: (task: KanbanTask) => void;
      onDeleted: (taskId: string) => void;
    }
  | {
      mode: "local";
      task: KanbanTask;
      users: TaskDirectoryUser[];
      isAdmin: boolean;
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onUpdate: (task: KanbanTask) => void;
      onDelete: (taskId: string) => void;
    };

export function TaskDialog(props: TaskDialogProps) {
  const { task, users, open, onOpenChange } = props;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assignedTo, setAssignedTo] = useState(
    task.assigned_to || "unassigned"
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setPriority(task.priority);
    setAssignedTo(task.assigned_to || "unassigned");
  }, [
    task.id,
    task.title,
    task.description,
    task.status,
    task.priority,
    task.assigned_to,
    task.updated_at,
  ]);

  const hasChanges =
    title !== task.title ||
    description !== (task.description || "") ||
    status !== task.status ||
    priority !== task.priority ||
    (assignedTo === "unassigned" ? null : assignedTo) !== task.assigned_to;

  const canDelete =
    props.mode === "server" ? props.canDelete : props.isAdmin;

  const buildPatchedTask = (): KanbanTask => {
    const assignee =
      assignedTo === "unassigned"
        ? null
        : (users.find((u) => u.id === assignedTo) ?? null);
    return {
      ...task,
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      assigned_to: assignedTo === "unassigned" ? null : assignedTo,
      updated_at: new Date().toISOString(),
      assignee: assignee
        ? {
            id: assignee.id,
            full_name: assignee.full_name,
            avatar_url: assignee.avatar_url,
          }
        : null,
      branches: task.branches ?? [],
    };
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (props.mode === "local") {
      setSaving(true);
      window.setTimeout(() => {
        props.onUpdate(buildPatchedTask());
        toast.success("Task updated successfully!");
        setSaving(false);
        onOpenChange(false);
      }, 400);
      return;
    }

    setSaving(true);
    const result = await updateTask({
      board_id: props.boardId,
      id: task.id,
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      assigned_to: assignedTo === "unassigned" ? null : assignedTo,
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    props.onUpdated(result.data);
    toast.success("Task updated successfully!");
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (props.mode === "local") {
      setDeleting(true);
      window.setTimeout(() => {
        props.onDelete(task.id);
        toast.success("Task deleted");
        setDeleting(false);
        onOpenChange(false);
      }, 400);
      return;
    }

    setDeleting(true);
    const result = await deleteTask({ board_id: props.boardId, id: task.id });
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    props.onDeleted(task.id);
    toast.success("Task deleted");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="editTitle">Title</Label>
            <Input
              id="editTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editDesc">Description</Label>
            <Textarea
              id="editDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add a description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => v && setStatus(v as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => v && setPriority(v as TaskPriority)}
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
          </div>

          <div className="space-y-2">
            <Label>Assigned to</Label>
            <Select
              value={assignedTo}
              onValueChange={(v) => v && setAssignedTo(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {task.branches && task.branches.length > 0 && (
            <div className="space-y-2">
              <Label>Linked Branches</Label>
              <div className="flex flex-wrap gap-2">
                {task.branches.map((branch) => (
                  <Badge
                    key={branch.id}
                    variant="secondary"
                    className={`gap-1 text-xs ${getStatusColor(branch.status)}`}
                  >
                    <GitBranch className="h-3 w-3" />
                    {branch.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Created {formatRelativeTime(task.created_at)}
            {task.updated_at !== task.created_at && (
              <> · Updated {formatRelativeTime(task.updated_at)}</>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            {canDelete && (
              <Button
                variant="destructive"
                size="sm"
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-1.5"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="button"
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="gap-1.5"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
