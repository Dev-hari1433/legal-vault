/*
# Create system tables: death_verification, notifications, audit_logs, activity_logs, admin_users

## Overview
This migration creates the platform-level tables that support security, observability,
and administration. These tables have different ownership models — some are user-scoped,
some are admin-scoped, and admin_users links auth.users to an admin role.

## New Tables

### death_verification
Records used to verify a user's death before triggering vault release to trusted contacts.
- user_id (FK → profiles.id), verifier_id (FK → auth.users), status, verification_method,
  death_certificate_url, verified_at, vault_release_triggered

### notifications
User-facing notifications (security alerts, reminders, etc.).
- user_id (FK → profiles.id), type, title, body, is_read, read_at, action_url

### audit_logs
Security-critical audit trail (logins, access changes, deletions, etc.).
- user_id (FK → profiles.id), actor_id (FK → auth.users), action, entity_type, entity_id,
  ip_address, user_agent, metadata

### activity_logs
General user activity feed (uploads, edits, shares — lower-sensitivity than audit_logs).
- user_id (FK → profiles.id), action, entity_type, entity_id, description, metadata

### admin_users
Links auth.users to admin privileges. Only rows here mark a user as admin.
- user_id (FK → auth.users, UNIQUE), role, permissions jsonb, granted_by (FK → auth.users)

## Security

### death_verification
- RLS: user can SELECT their own records. INSERT/UPDATE/DELETE restricted to service role
  (admin/system) — standard authenticated users cannot create or modify death verifications.
  This prevents abuse: a user must not be able to self-report their own death to trigger
  vault release.

### notifications
- RLS: full owner-scoped CRUD (user manages their own notifications).

### audit_logs
- RLS: user can SELECT their own audit logs. INSERT allowed for owner (system writes on
  behalf). UPDATE/DELETE restricted to service role — audit trails must be immutable for users.

### activity_logs
- RLS: user can SELECT and INSERT their own activity logs. UPDATE/DELETE restricted to
  service role.

### admin_users
- RLS: any authenticated user can SELECT (to check if someone is an admin). INSERT/UPDATE/DELETE
  restricted to service role only — users cannot self-grant admin.

## Indexes
- user_id indexes on all tables.
- status / is_read / action / created_at indexes on hot query columns.

## Important Notes
1. admin_users.user_id has a UNIQUE constraint — one admin record per auth user.
2. audit_logs and activity_logs use `actor_id` / `user_id` respectively; both reference auth.users.
3. The `set_updated_at()` trigger function is reused from the initial migration.
4. death_verification.verifier_id is nullable because the system may auto-verify in some flows.
*/

-- ============================================================================
-- death_verification
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.death_verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verifier_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  verification_method text,
  death_certificate_url text,
  verified_at timestamptz,
  vault_release_triggered boolean NOT NULL DEFAULT false,
  vault_release_triggered_at timestamptz,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.death_verification ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_death_verification_user_id ON public.death_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_death_verification_status ON public.death_verification(status) WHERE deleted_at IS NULL;

-- Users can view their own death verification records (transparency)
DROP POLICY IF EXISTS "select_own_death_verification" ON public.death_verification;
CREATE POLICY "select_own_death_verification" ON public.death_verification FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

-- INSERT/UPDATE/DELETE: no client policies — only service role can manage these.
-- This is intentional: users must not be able to create or alter death verifications.

DROP TRIGGER IF EXISTS death_verification_set_updated_at ON public.death_verification;
CREATE TRIGGER death_verification_set_updated_at BEFORE UPDATE ON public.death_verification
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  action_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

DROP POLICY IF EXISTS "select_own_notifications" ON public.notifications;
CREATE POLICY "select_own_notifications" ON public.notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_notifications" ON public.notifications;
CREATE POLICY "insert_own_notifications" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON public.notifications;
CREATE POLICY "update_own_notifications" ON public.notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON public.notifications;
CREATE POLICY "delete_own_notifications" ON public.notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS notifications_set_updated_at ON public.notifications;
CREATE TRIGGER notifications_set_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- audit_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Users can read their own audit logs
DROP POLICY IF EXISTS "select_own_audit_logs" ON public.audit_logs;
CREATE POLICY "select_own_audit_logs" ON public.audit_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

-- System can insert audit logs on behalf of the user
DROP POLICY IF EXISTS "insert_own_audit_logs" ON public.audit_logs;
CREATE POLICY "insert_own_audit_logs" ON public.audit_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE policies for users — audit logs are immutable for clients.

DROP TRIGGER IF EXISTS audit_logs_set_updated_at ON public.audit_logs;
CREATE TRIGGER audit_logs_set_updated_at BEFORE UPDATE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- activity_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

DROP POLICY IF EXISTS "select_own_activity_logs" ON public.activity_logs;
CREATE POLICY "select_own_activity_logs" ON public.activity_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_activity_logs" ON public.activity_logs;
CREATE POLICY "insert_own_activity_logs" ON public.activity_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE policies for users — activity logs are immutable for clients.

DROP TRIGGER IF EXISTS activity_logs_set_updated_at ON public.activity_logs;
CREATE TRIGGER activity_logs_set_updated_at BEFORE UPDATE ON public.activity_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- admin_users
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  permissions jsonb DEFAULT '{}'::jsonb,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role) WHERE deleted_at IS NULL;

-- Any authenticated user can check if a user is an admin (needed for UI role checks)
DROP POLICY IF EXISTS "select_admin_users" ON public.admin_users;
CREATE POLICY "select_admin_users" ON public.admin_users FOR SELECT
  TO authenticated USING (deleted_at IS NULL);

-- No INSERT/UPDATE/DELETE policies for clients — only service role can manage admins.

DROP TRIGGER IF EXISTS admin_users_set_updated_at ON public.admin_users;
CREATE TRIGGER admin_users_set_updated_at BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
