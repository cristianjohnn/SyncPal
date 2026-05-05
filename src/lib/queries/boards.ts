import { createClient } from "@/lib/supabase/server";
import type { Board, Branch, Task, TaskStatus, User } from "@/types/database";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(id: string): boolean {
  return UUID_RE.test(id);
}

/** Assignee subset embedded on tasks */
export type TaskAssigneeEmbed = Pick<User, "id" | "full_name" | "avatar_url">;

/** Serializable task row for Kanban + TaskDialog */
export type KanbanTask = Task & {
  assignee: TaskAssigneeEmbed | null;
  branches: Branch[];
};

export type BoardCreatorEmbed = Pick<User, "id" | "full_name" | "avatar_url">;

export type BoardListItem = Board & {
  creator: BoardCreatorEmbed | null;
  taskCounts: Record<TaskStatus, number>;
};

export type BoardDirectoryUser = Pick<User, "id" | "full_name" | "avatar_url" | "email">;

export interface KanbanPageSession {
  userId: string;
  isAdmin: boolean;
}

export interface KanbanPageData {
  board: Board;
  tasks: KanbanTask[];
  users: BoardDirectoryUser[];
  session: KanbanPageSession;
}

function emptyCounts(): Record<TaskStatus, number> {
  return { todo: 0, in_progress: 0, review: 0, done: 0 };
}

export function normalizeKanbanTaskRow(row: unknown): KanbanTask | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const assigneeRaw = r.assignee;
  let assignee: TaskAssigneeEmbed | null = null;
  if (assigneeRaw && typeof assigneeRaw === "object" && !Array.isArray(assigneeRaw)) {
    const a = assigneeRaw as Record<string, unknown>;
    if (typeof a.id === "string" && typeof a.full_name === "string") {
      assignee = {
        id: a.id,
        full_name: a.full_name,
        avatar_url: typeof a.avatar_url === "string" ? a.avatar_url : null,
      };
    }
  }

  let branches: Branch[] = [];
  const br = r.branches;
  if (Array.isArray(br)) {
    branches = br.filter((b): b is Branch => !!b && typeof b === "object" && "id" in b) as Branch[];
  }

  const {
    id,
    title,
    description,
    status,
    priority,
    board_id,
    assigned_to,
    created_by,
    created_at,
    updated_at,
  } = r;

  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof status !== "string" ||
    typeof priority !== "string" ||
    typeof board_id !== "string" ||
    typeof created_by !== "string" ||
    typeof created_at !== "string" ||
    typeof updated_at !== "string"
  ) {
    return null;
  }

  return {
    id,
    title,
    description: typeof description === "string" ? description : null,
    status: status as KanbanTask["status"],
    priority: priority as KanbanTask["priority"],
    board_id,
    assigned_to: typeof assigned_to === "string" ? assigned_to : null,
    created_by,
    created_at,
    updated_at,
    assignee,
    branches,
  };
}

export async function fetchBoardsPageData(): Promise<
  | { ok: true; boards: BoardListItem[] }
  | { ok: false; error: string }
> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { ok: false, error: "Not authenticated." };
  }

  const { data: boardRows, error: boardsError } = await supabase
    .from("boards")
    .select(
      `
      *,
      creator:users!boards_created_by_fkey(id, full_name, avatar_url)
    `
    )
    .order("created_at", { ascending: false });

  if (boardsError) {
    return { ok: false, error: boardsError.message };
  }

  const boards = (boardRows ?? []) as unknown as Array<
    Board & {
      creator: BoardCreatorEmbed | BoardCreatorEmbed[] | null;
    }
  >;

  const boardIds = boards.map((b) => b.id);
  const countsByBoard = new Map<string, Record<TaskStatus, number>>();

  for (const id of boardIds) {
    countsByBoard.set(id, emptyCounts());
  }

  if (boardIds.length > 0) {
    const { data: taskRows, error: tasksError } = await supabase
      .from("tasks")
      .select("board_id, status")
      .in("board_id", boardIds);

    if (tasksError) {
      return { ok: false, error: tasksError.message };
    }

    for (const row of taskRows ?? []) {
      const bid = row.board_id as string;
      const st = row.status as TaskStatus;
      const m = countsByBoard.get(bid);
      if (m && st in m) {
        m[st] += 1;
      }
    }
  }

  const list: BoardListItem[] = boards.map((b) => {
    const cr = b.creator;
    const creator =
      Array.isArray(cr) ? cr[0] ?? null : cr && typeof cr === "object" ? cr : null;

    return {
      id: b.id,
      name: b.name,
      description: b.description,
      created_by: b.created_by,
      created_at: b.created_at,
      creator,
      taskCounts: countsByBoard.get(b.id) ?? emptyCounts(),
    };
  });

  return { ok: true, boards: list };
}

export async function fetchBoardKanbanData(
  boardId: string
): Promise<
  | { ok: true; data: KanbanPageData }
  | { ok: false; error: string; notFound?: boolean }
> {
  if (!isValidUuid(boardId)) {
    return { ok: false, error: "Invalid board id.", notFound: true };
  }

  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { ok: false, error: "Not authenticated." };
  }

  const [
    profileResult,
    boardResult,
    tasksResult,
    usersResult,
  ] = await Promise.all([
    supabase.from("users").select("role").eq("id", authUser.id).single(),
    supabase.from("boards").select("*").eq("id", boardId).single(),
    supabase
      .from("tasks")
      .select(
        `
        *,
        assignee:users!tasks_assigned_to_fkey(id, full_name, avatar_url),
        branches(*)
      `
      )
      .eq("board_id", boardId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("users")
      .select("id, full_name, avatar_url, email")
      .order("full_name", { ascending: true }),
  ]);

  if (profileResult.error || !profileResult.data) {
    return {
      ok: false,
      error: profileResult.error?.message ?? "Could not load profile.",
    };
  }

  if (boardResult.error || !boardResult.data) {
    const msg = boardResult.error?.message ?? "Board not found.";
    const notFound =
      boardResult.error?.code === "PGRST116" ||
      msg.toLowerCase().includes("no rows");
    return { ok: false, error: msg, notFound };
  }

  if (tasksResult.error) {
    return { ok: false, error: tasksResult.error.message };
  }

  if (usersResult.error) {
    return { ok: false, error: usersResult.error.message };
  }

  const tasksRaw = tasksResult.data ?? [];
  const tasks: KanbanTask[] = [];
  for (const row of tasksRaw) {
    const normalized = normalizeKanbanTaskRow(row);
    if (normalized) tasks.push(normalized);
  }

  const board = boardResult.data as Board;

  const users = (usersResult.data ?? []) as BoardDirectoryUser[];

  return {
    ok: true,
    data: {
      board,
      tasks,
      users,
      session: {
        userId: authUser.id,
        isAdmin: profileResult.data.role === "admin",
      },
    },
  };
}
