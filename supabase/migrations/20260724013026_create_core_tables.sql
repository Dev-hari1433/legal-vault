/*
# Create core user-owned tables

## Overview
This migration creates the primary data tables for LegacyVault — every table that
stores a user's personal legacy data. Each table is owner-scoped (user_id → profiles.id)
with full CRUD RLS policies, soft-delete support (deleted_at), indexes on hot columns,
and automatic updated_at maintenance.

## New Tables

### trusted_contacts
People the user designates for emergency access or vault inheritance.
- user_id (FK → profiles.id), name, email, phone, relationship, access_level, priority, status

### digital_assets
Top-level encrypted asset entries (passwords, keys, account credentials).
- user_id (FK → profiles.id), title, asset_type, encrypted_data, notes, is_shared

### documents
Important documents (wills, certificates, deeds, contracts).
- user_id (FK → profiles.id), title, category, file_url, file_size, mime_type, is_verified, verified_at

### photos
Photo gallery items with album grouping.
- user_id (FK → profiles.id), title, album_id, file_url, file_size, width, height, caption

### medical_information
Medical records: conditions, medications, allergies, blood type, emergency notes.
- user_id (FK → profiles.id), blood_type, height, weight, organ_donor, conditions, medications, allergies, notes

### insurance
Insurance policies (life, health, auto, home, etc.).
- user_id (FK → profiles.id), policy_type, provider, policy_number, coverage_amount, premium, beneficiary, status, start_date, end_date

### financial_assets
Bank accounts, investments, real estate, crypto, personal property.
- user_id (FK → profiles.id), asset_name, asset_type, institution, balance, account_number, notes

### subscriptions
Recurring subscriptions and recurring payments.
- user_id (FK → profiles.id), name, category, cost, billing_cycle, next_billing_date, status

### social_accounts
Social media accounts for memorialization / access transfer.
- user_id (FK → profiles.id), platform, handle, followers, memorialization_status, access_instructions

### digital_will
The user's digital will — one row per user (enforced by unique constraint).
- user_id (FK → profiles.id), title, status, content_json, last_reviewed_at, witnessed_at

### emergency_messages
Pre-written messages to be delivered to trusted contacts upon verification.
- user_id (FK → profiles.id), contact_id (FK → trusted_contacts.id), subject, body, delivery_trigger, is_delivered, delivered_at

## Modified Tables
### profiles
- Added `deleted_at` column for soft-delete consistency.

## Security
- RLS enabled on every new table.
- Four owner-scoped policies (SELECT/INSERT/UPDATE/DELETE) per table using auth.uid() = user_id.
- INSERT policies use WITH CHECK; UPDATE policies use both USING and WITH CHECK.
- user_id columns default to auth.uid() so client inserts that omit user_id succeed.

## Indexes
- Every table gets an index on user_id (the most common filter).
- Additional indexes on frequently-queried columns (status, category, created_at, etc.).

## Important Notes
1. All tables use `deleted_at timestamptz DEFAULT NULL` for soft deletes. Queries should
   filter `WHERE deleted_at IS NULL` to exclude soft-deleted rows.
2. The `set_updated_at()` trigger function already exists from the profiles migration.
   Each table gets its own `BEFORE UPDATE` trigger calling this function.
3. `digital_will` has a UNIQUE constraint on user_id — one will per user.
4. `emergency_messages.contact_id` is a FK to trusted_contacts, with ON DELETE SET NULL
   so deleting a contact doesn't lose the message record.
*/

-- Add soft-delete column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- ============================================================================
-- trusted_contacts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trusted_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  relationship text,
  access_level text NOT NULL DEFAULT 'limited',
  priority text DEFAULT 'secondary',
  status text NOT NULL DEFAULT 'active',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user_id ON public.trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_status ON public.trusted_contacts(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_created_at ON public.trusted_contacts(created_at DESC);

DROP POLICY IF EXISTS "select_own_trusted_contacts" ON public.trusted_contacts;
CREATE POLICY "select_own_trusted_contacts" ON public.trusted_contacts FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_trusted_contacts" ON public.trusted_contacts;
CREATE POLICY "insert_own_trusted_contacts" ON public.trusted_contacts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_trusted_contacts" ON public.trusted_contacts;
CREATE POLICY "update_own_trusted_contacts" ON public.trusted_contacts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_trusted_contacts" ON public.trusted_contacts;
CREATE POLICY "delete_own_trusted_contacts" ON public.trusted_contacts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS trusted_contacts_set_updated_at ON public.trusted_contacts;
CREATE TRIGGER trusted_contacts_set_updated_at BEFORE UPDATE ON public.trusted_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- digital_assets
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.digital_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  asset_type text NOT NULL,
  encrypted_data text,
  notes text,
  is_shared boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.digital_assets ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_digital_assets_user_id ON public.digital_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_assets_type ON public.digital_assets(asset_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_digital_assets_created_at ON public.digital_assets(created_at DESC);

DROP POLICY IF EXISTS "select_own_digital_assets" ON public.digital_assets;
CREATE POLICY "select_own_digital_assets" ON public.digital_assets FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_digital_assets" ON public.digital_assets;
CREATE POLICY "insert_own_digital_assets" ON public.digital_assets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_digital_assets" ON public.digital_assets;
CREATE POLICY "update_own_digital_assets" ON public.digital_assets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_digital_assets" ON public.digital_assets;
CREATE POLICY "delete_own_digital_assets" ON public.digital_assets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS digital_assets_set_updated_at ON public.digital_assets;
CREATE TRIGGER digital_assets_set_updated_at BEFORE UPDATE ON public.digital_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- documents
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  file_url text,
  file_size bigint,
  mime_type text,
  is_verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

DROP POLICY IF EXISTS "select_own_documents" ON public.documents;
CREATE POLICY "select_own_documents" ON public.documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_documents" ON public.documents;
CREATE POLICY "insert_own_documents" ON public.documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON public.documents;
CREATE POLICY "update_own_documents" ON public.documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON public.documents;
CREATE POLICY "delete_own_documents" ON public.documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS documents_set_updated_at ON public.documents;
CREATE TRIGGER documents_set_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- photos
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text,
  album_id uuid,
  file_url text NOT NULL,
  thumbnail_url text,
  file_size bigint,
  width integer,
  height integer,
  caption text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON public.photos(album_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);

DROP POLICY IF EXISTS "select_own_photos" ON public.photos;
CREATE POLICY "select_own_photos" ON public.photos FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_photos" ON public.photos;
CREATE POLICY "insert_own_photos" ON public.photos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_photos" ON public.photos;
CREATE POLICY "update_own_photos" ON public.photos FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_photos" ON public.photos;
CREATE POLICY "delete_own_photos" ON public.photos FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS photos_set_updated_at ON public.photos;
CREATE TRIGGER photos_set_updated_at BEFORE UPDATE ON public.photos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- medical_information
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.medical_information (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  blood_type text,
  height text,
  weight text,
  organ_donor boolean DEFAULT false,
  conditions jsonb DEFAULT '[]'::jsonb,
  medications jsonb DEFAULT '[]'::jsonb,
  allergies jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.medical_information ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_medical_info_user_id ON public.medical_information(user_id);

DROP POLICY IF EXISTS "select_own_medical_info" ON public.medical_information;
CREATE POLICY "select_own_medical_info" ON public.medical_information FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_medical_info" ON public.medical_information;
CREATE POLICY "insert_own_medical_info" ON public.medical_information FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_medical_info" ON public.medical_information;
CREATE POLICY "update_own_medical_info" ON public.medical_information FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_medical_info" ON public.medical_information;
CREATE POLICY "delete_own_medical_info" ON public.medical_information FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS medical_info_set_updated_at ON public.medical_information;
CREATE TRIGGER medical_info_set_updated_at BEFORE UPDATE ON public.medical_information
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- insurance
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.insurance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  policy_type text NOT NULL,
  provider text NOT NULL,
  policy_number text,
  coverage_amount text,
  premium text,
  beneficiary text,
  status text NOT NULL DEFAULT 'active',
  start_date date,
  end_date date,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.insurance ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_insurance_user_id ON public.insurance(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_status ON public.insurance(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_insurance_type ON public.insurance(policy_type) WHERE deleted_at IS NULL;

DROP POLICY IF EXISTS "select_own_insurance" ON public.insurance;
CREATE POLICY "select_own_insurance" ON public.insurance FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_insurance" ON public.insurance;
CREATE POLICY "insert_own_insurance" ON public.insurance FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_insurance" ON public.insurance;
CREATE POLICY "update_own_insurance" ON public.insurance FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_insurance" ON public.insurance;
CREATE POLICY "delete_own_insurance" ON public.insurance FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS insurance_set_updated_at ON public.insurance;
CREATE TRIGGER insurance_set_updated_at BEFORE UPDATE ON public.insurance
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- financial_assets
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.financial_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset_name text NOT NULL,
  asset_type text NOT NULL,
  institution text,
  balance text,
  account_number text,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.financial_assets ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_financial_assets_user_id ON public.financial_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_assets_type ON public.financial_assets(asset_type) WHERE deleted_at IS NULL;

DROP POLICY IF EXISTS "select_own_financial_assets" ON public.financial_assets;
CREATE POLICY "select_own_financial_assets" ON public.financial_assets FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_financial_assets" ON public.financial_assets;
CREATE POLICY "insert_own_financial_assets" ON public.financial_assets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_financial_assets" ON public.financial_assets;
CREATE POLICY "update_own_financial_assets" ON public.financial_assets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_financial_assets" ON public.financial_assets;
CREATE POLICY "delete_own_financial_assets" ON public.financial_assets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS financial_assets_set_updated_at ON public.financial_assets;
CREATE TRIGGER financial_assets_set_updated_at BEFORE UPDATE ON public.financial_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- subscriptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  cost numeric(10,2) NOT NULL DEFAULT 0,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  next_billing_date date,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON public.subscriptions(next_billing_date) WHERE deleted_at IS NULL;

DROP POLICY IF EXISTS "select_own_subscriptions" ON public.subscriptions;
CREATE POLICY "select_own_subscriptions" ON public.subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_subscriptions" ON public.subscriptions;
CREATE POLICY "insert_own_subscriptions" ON public.subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscriptions" ON public.subscriptions;
CREATE POLICY "update_own_subscriptions" ON public.subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_subscriptions" ON public.subscriptions;
CREATE POLICY "delete_own_subscriptions" ON public.subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS subscriptions_set_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_set_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- social_accounts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  handle text,
  followers text,
  memorialization_status text NOT NULL DEFAULT 'none',
  access_instructions text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON public.social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON public.social_accounts(platform) WHERE deleted_at IS NULL;

DROP POLICY IF EXISTS "select_own_social_accounts" ON public.social_accounts;
CREATE POLICY "select_own_social_accounts" ON public.social_accounts FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_social_accounts" ON public.social_accounts;
CREATE POLICY "insert_own_social_accounts" ON public.social_accounts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_social_accounts" ON public.social_accounts;
CREATE POLICY "update_own_social_accounts" ON public.social_accounts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_social_accounts" ON public.social_accounts;
CREATE POLICY "delete_own_social_accounts" ON public.social_accounts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS social_accounts_set_updated_at ON public.social_accounts;
CREATE TRIGGER social_accounts_set_updated_at BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- digital_will
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.digital_will (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'My Digital Will',
  status text NOT NULL DEFAULT 'draft',
  content_json jsonb DEFAULT '{}'::jsonb,
  last_reviewed_at timestamptz,
  witnessed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

-- One will per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_digital_will_user_unique ON public.digital_will(user_id) WHERE deleted_at IS NULL;

ALTER TABLE public.digital_will ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_digital_will_user_id ON public.digital_will(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_will_status ON public.digital_will(status) WHERE deleted_at IS NULL;

DROP POLICY IF EXISTS "select_own_digital_will" ON public.digital_will;
CREATE POLICY "select_own_digital_will" ON public.digital_will FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_digital_will" ON public.digital_will;
CREATE POLICY "insert_own_digital_will" ON public.digital_will FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_digital_will" ON public.digital_will;
CREATE POLICY "update_own_digital_will" ON public.digital_will FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_digital_will" ON public.digital_will;
CREATE POLICY "delete_own_digital_will" ON public.digital_will FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS digital_will_set_updated_at ON public.digital_will;
CREATE TRIGGER digital_will_set_updated_at BEFORE UPDATE ON public.digital_will
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- emergency_messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.emergency_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.trusted_contacts(id) ON DELETE SET NULL,
  subject text NOT NULL,
  body text NOT NULL,
  delivery_trigger text NOT NULL DEFAULT 'death_verification',
  is_delivered boolean NOT NULL DEFAULT false,
  delivered_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.emergency_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_emergency_messages_user_id ON public.emergency_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_messages_contact_id ON public.emergency_messages(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_emergency_messages_delivered ON public.emergency_messages(is_delivered) WHERE deleted_at IS NULL;

DROP POLICY IF EXISTS "select_own_emergency_messages" ON public.emergency_messages;
CREATE POLICY "select_own_emergency_messages" ON public.emergency_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "insert_own_emergency_messages" ON public.emergency_messages;
CREATE POLICY "insert_own_emergency_messages" ON public.emergency_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_emergency_messages" ON public.emergency_messages;
CREATE POLICY "update_own_emergency_messages" ON public.emergency_messages FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_emergency_messages" ON public.emergency_messages;
CREATE POLICY "delete_own_emergency_messages" ON public.emergency_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS emergency_messages_set_updated_at ON public.emergency_messages;
CREATE TRIGGER emergency_messages_set_updated_at BEFORE UPDATE ON public.emergency_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
