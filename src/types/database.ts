export type UserRole = "admin" | "user";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type BranchStatus = "ongoing" | "review" | "merged";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  designation: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
}

export interface Task {
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
}

export interface Branch {
  id: string;
  name: string;
  status: BranchStatus;
  task_id: string | null;
  created_by: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Extended types with relations
export interface TaskWithAssignee extends Task {
  assignee?: User | null;
  board?: Board | null;
  branches?: Branch[];
}

export interface BoardWithTasks extends Board {
  tasks?: Task[];
  creator?: User | null;
  task_count?: number;
}

export interface ActivityLogWithUser extends ActivityLog {
  user?: User | null;
}

// Form types
export interface CreateBoardInput {
  name: string;
  description?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  board_id: string;
  assigned_to?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string | null;
}

export interface CreateBranchInput {
  name: string;
  status?: BranchStatus;
  task_id?: string;
}
