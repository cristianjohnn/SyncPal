"use client";

import { useState } from "react";
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
import { getPriorityColor, getStatusColor, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { TaskStatus, TaskPriority } from "@/types/database";

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
  branches?: Array<{ id: string; name: string; status: string }>;
}

interface TaskDialogProps {
  task: TaskWithRelations;
  users: Array<{ id: string; full_name: string; avatar_url: string | null; email: string }>;
  isAdmin: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (task: TaskWithRelations) => void;
  onDelete: (taskId: string) => void;
}

export function TaskDialog({
  task,
  users,
  isAdmin,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: TaskDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assignedTo, setAssignedTo] = useState(task.assigned_to || "unassigned");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasChanges =
    title !== task.title ||
    description !== (task.description || "") ||
    status !== task.status ||
    priority !== task.priority ||
    (assignedTo === "unassigned" ? null : assignedTo) !== task.assigned_to;

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    setSaving(true);
    
    const assignee = users.find(u => u.id === assignedTo);
    
    setTimeout(() => {
      onUpdate({
        ...task,
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        assigned_to: assignedTo === "unassigned" ? null : assignedTo,
        updated_at: new Date().toISOString(),
        assignee: assignee || null
      });
      toast.success("Task updated successfully!");
      setSaving(false);
      onOpenChange(false);
    }, 500);
  };

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => {
      onDelete(task.id);
      toast.success("Task deleted");
      setDeleting(false);
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="editTitle">Title</Label>
            <Input
              id="editTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
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

          {/* Status & Priority */}
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

          {/* Assignee */}
          <div className="space-y-2">
            <Label>Assigned to</Label>
            <Select value={assignedTo} onValueChange={(v) => v && setAssignedTo(v)}>
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

          {/* Branches */}
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

          {/* Meta info */}
          <div className="text-xs text-muted-foreground">
            Created {formatRelativeTime(task.created_at)}
            {task.updated_at !== task.created_at && (
              <> · Updated {formatRelativeTime(task.updated_at)}</>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            {isAdmin && (
              <Button
                variant="destructive"
                size="sm"
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
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
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
