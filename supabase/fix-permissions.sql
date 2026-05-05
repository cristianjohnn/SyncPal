-- ================================================
-- Fix: Grant table-level permissions
-- ================================================
-- RLS policies alone are not enough — the PostgreSQL roles
-- also need GRANT-level access to the tables.
-- 
-- Without these GRANTs, even with correct RLS policies,
-- queries return "permission denied for table users" (error 42501).
--
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ================================================

-- Grant access to the 'authenticated' role (logged-in users)
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT SELECT, INSERT ON public.activity_log TO authenticated;

-- Grant read access to 'anon' role if needed for public pages (optional)
-- GRANT SELECT ON public.users TO anon;

-- Grant usage on sequences if any tables use serial/identity columns
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
