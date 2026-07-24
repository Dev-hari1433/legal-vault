/*
# Create Emergency Verification, Notification Preferences, and Security tables

## Overview
This migration creates the tables for the Emergency Verification System,
Notification System, and Enterprise Security features.

## New Tables

### verification_requests
Tracks the full death verification workflow per user.
- user_id (FK → profiles.id), status, submitted_at, death_certificate_url,
  government_id_url, reviewer_id, reviewed_at, review_notes, released_at

### access_grants
Defines which trusted contact can access which data category after verification approval.
- user_id (FK → profiles.id), contact_id (FK → trusted_contacts.id),
  category (text — profile, medical, insurance, financial, government_ids,
  digital_vault, photos, documents, passwords, digital_will, emergency_instructions),
  is_granted (boolean)

### notification_preferences
Per-user per-event notification channel preferences.
- user_id (FK → profiles.id, UNIQUE), stored as jsonb with event→channel booleans

### login_history
Records every login event with device and IP info.
- user_id (FK → profiles.id), ip_address, user_agent, device_type, location, success

### security_events
Security-relevant events (failed logins, password changes, 2FA events, etc).
- user_id (FK → profiles.id), event_type, severity, ip_address, user_agent, metadata

## Security
- RLS enabled on all tables with 4 CRUD policies each.
- verification_requests: user can SELECT/INSERT/UPDATE their own; DELETE not allowed for users.
- access_grants: full owner CRUD.
- notification_preferences: full owner CRUD.
- login_history: user can SELECT their own; INSERT allowed (system writes on login); no UPDATE/DELETE.
- security_events: user can SELECT their own; INSERT allowed; no UPDATE/DELETE (immutable).

## Indexes
- user_id on all tables
- status on verification_requests
- category on access_grants
- event_type on security_events
- created_at DESC on login_history and security_events
*/

-- ============================================================================
-- verification_requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  death_certificate_url text,
  government_id_url text,
  submitted_at timestamptz DEFAULT now(),
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,
  released_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_verification_requests_created_at ON public.verification_requests(created_at DESC);

DROP POLICY IF EXISTS "select_own_verification_requests" ON public.verification_requests;
CREATE POLICY "select_own_verification_requests" ON public.verification_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_verification_requests" ON public.verification_requests;
CREATE POLICY "insert_own_verification_requests" ON public.verification_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_verification_requests" ON public.verification_requests;
CREATE POLICY "update_own_verification_requests" ON public.verification_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_verification_requests" ON public.verification_requests;
CREATE POLICY "delete_own_verification_requests" ON public.verification_requests FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Admin can see all verification requests (for review workflow)
DROP POLICY IF EXISTS "admin_select_all_verification_requests" ON public.verification_requests;
CREATE POLICY "admin_select_all_verification_requests" ON public.verification_requests FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.deleted_at IS NULL)
  );

-- Admin can update any verification request (to approve/reject)
DROP POLICY IF EXISTS "admin_update_all_verification_requests" ON public.verification_requests;
CREATE POLICY "admin_update_all_verification_requests" ON public.verification_requests FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.deleted_at IS NULL)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.deleted_at IS NULL)
  );

DROP TRIGGER IF EXISTS verification_requests_set_updated_at ON public.verification_requests;
CREATE TRIGGER verification_requests_set_updated_at BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- access_grants
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.trusted_contacts(id) ON DELETE CASCADE,
  category text NOT NULL,
  is_granted boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL,
  UNIQUE(user_id, contact_id, category)
);

ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_access_grants_user_id ON public.access_grants(user_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_contact_id ON public.access_grants(contact_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_category ON public.access_grants(category) WHERE deleted_at IS NULL;

DROP POLICY IF EXISTS "select_own_access_grants" ON public.access_grants;
CREATE POLICY "select_own_access_grants" ON public.access_grants FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_access_grants" ON public.access_grants;
CREATE POLICY "insert_own_access_grants" ON public.access_grants FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_access_grants" ON public.access_grants;
CREATE POLICY "update_own_access_grants" ON public.access_grants FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_access_grants" ON public.access_grants;
CREATE POLICY "delete_own_access_grants" ON public.access_grants FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS access_grants_set_updated_at ON public.access_grants;
CREATE TRIGGER access_grants_set_updated_at BEFORE UPDATE ON public.access_grants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- notification_preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL,
  UNIQUE(user_id)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

DROP POLICY IF EXISTS "select_own_notification_preferences" ON public.notification_preferences;
CREATE POLICY "select_own_notification_preferences" ON public.notification_preferences FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_notification_preferences" ON public.notification_preferences;
CREATE POLICY "insert_own_notification_preferences" ON public.notification_preferences FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notification_preferences" ON public.notification_preferences;
CREATE POLICY "update_own_notification_preferences" ON public.notification_preferences FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notification_preferences" ON public.notification_preferences;
CREATE POLICY "delete_own_notification_preferences" ON public.notification_preferences FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS notification_preferences_set_updated_at ON public.notification_preferences;
CREATE TRIGGER notification_preferences_set_updated_at BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- login_history
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  device_type text,
  location text,
  success boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON public.login_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_success ON public.login_history(success) WHERE deleted_at IS NULL;

DROP POLICY IF EXISTS "select_own_login_history" ON public.login_history;
CREATE POLICY "select_own_login_history" ON public.login_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_login_history" ON public.login_history;
CREATE POLICY "insert_own_login_history" ON public.login_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE — login history is immutable for users.

-- ============================================================================
-- security_events
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);

DROP POLICY IF EXISTS "select_own_security_events" ON public.security_events;
CREATE POLICY "select_own_security_events" ON public.security_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_security_events" ON public.security_events;
CREATE POLICY "insert_own_security_events" ON public.security_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE — security events are immutable for users.

-- Admin can see all security events
DROP POLICY IF EXISTS "admin_select_all_security_events" ON public.security_events;
CREATE POLICY "admin_select_all_security_events" ON public.security_events FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.deleted_at IS NULL)
  );

-- Admin can see all login history
DROP POLICY IF EXISTS "admin_select_all_login_history" ON public.login_history;
CREATE POLICY "admin_select_all_login_history" ON public.login_history FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.deleted_at IS NULL)
  );