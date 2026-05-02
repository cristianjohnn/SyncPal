-- ================================================
-- Synqr — Complete Database Schema
-- Run this in your Supabase SQL Editor
-- ================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. USERS TABLE
-- ================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  designation TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- 2. BOARDS TABLE
-- ================================================
CREATE TABLE public.boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- 3. TASKS TABLE
-- ================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- 4. BRANCHES TABLE
-- ================================================
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'review', 'merged')),
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- 5. ACTIVITY LOG TABLE
-- ================================================
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX idx_tasks_board_id ON public.tasks(board_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_branches_task_id ON public.branches(task_id);
CREATE INDEX idx_branches_status ON public.branches(status);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- ================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------
-- USERS POLICIES
-- ------------------------------------------------
-- All authenticated users can read all profiles
CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (signup)
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (role changes)
CREATE POLICY "Admins can update any profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------
-- BOARDS POLICIES
-- ------------------------------------------------
-- All authenticated users can read boards
CREATE POLICY "Authenticated users can read boards"
  ON public.boards FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create boards
CREATE POLICY "Authenticated users can create boards"
  ON public.boards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Board creators and admins can update boards
CREATE POLICY "Board creators and admins can update boards"
  ON public.boards FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Board creators and admins can delete boards
CREATE POLICY "Board creators and admins can delete boards"
  ON public.boards FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------
-- TASKS POLICIES
-- ------------------------------------------------
-- All authenticated users can read tasks
CREATE POLICY "Authenticated users can read tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create tasks
CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Task creators, assignees, and admins can update tasks
CREATE POLICY "Task creators, assignees and admins can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Task creators and admins can delete tasks
CREATE POLICY "Task creators and admins can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------
-- BRANCHES POLICIES
-- ------------------------------------------------
-- All authenticated users can read branches
CREATE POLICY "Authenticated users can read branches"
  ON public.branches FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create branches
CREATE POLICY "Authenticated users can create branches"
  ON public.branches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Branch creators and admins can update branches
CREATE POLICY "Branch creators and admins can update branches"
  ON public.branches FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Branch creators and admins can delete branches
CREATE POLICY "Branch creators and admins can delete branches"
  ON public.branches FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------
-- ACTIVITY LOG POLICIES
-- ------------------------------------------------
-- All authenticated users can read activity logs
CREATE POLICY "Authenticated users can read activity logs"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can insert activity logs
CREATE POLICY "Authenticated users can insert activity logs"
  ON public.activity_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
