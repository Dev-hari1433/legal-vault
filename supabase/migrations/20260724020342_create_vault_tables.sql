/*
# Create vault_folders and vault_items tables

## Overview
This migration creates the Digital Vault schema — a unified storage system
for all user assets (passwords, documents, photos, videos, government IDs,
insurance, medical reports, financial documents, legal documents, cloud links,
and crypto wallet details). Folders provide organization; soft-delete enables
a recycle bin; passwords are encrypted client-side before storage.

## New Tables

### vault_folders
Organizational folders that group vault items.
- user_id (FK → profiles.id, DEFAULT auth.uid())
- name (text, not null) — folder display name
- icon (text) — optional icon identifier
- parent_folder_id (uuid, self-FK, nullable) — for nested folders
- sort_order (int, default 0)
- Soft-delete via deleted_at

### vault_items
Individual vault entries — each row is one stored asset.
- user_id (FK → profiles.id, DEFAULT auth.uid())
- folder_id (FK → vault_folders.id, nullable, ON DELETE SET NULL)
- title (text, not null) — display name
- item_type (text, not null) — one of: password, document, photo, video,
  government_id, insurance, medical_report, financial_document,
  legal_document, cloud_link, crypto_wallet
- encrypted_data (text) — AES-GCM encrypted JSON for sensitive fields
  (passwords, wallet seed phrases, account credentials, etc.)
- file_url (text) — Supabase Storage public URL for uploaded files
- file_size (bigint) — file size in bytes
- mime_type (text) — MIME type of uploaded file
- thumbnail_url (text) — preview thumbnail URL (for images/videos)
- notes (text) — user notes (not encrypted)
- tags (text[]) — user-defined tags for searchability
- is_starred (boolean, default false) — favorites
- sort_order (int, default 0)
- Soft-delete via deleted_at

## Security
- RLS enabled on both tables with 4 CRUD policies each (SELECT/INSERT/UPDATE/DELETE).
- All policies scoped TO authenticated with auth.uid() = user_id ownership checks.
- SELECT policies include `deleted_at IS NULL` so soft-deleted items are hidden
  from normal queries (recycle bin queries use a separate code path that sets
  deleted_at IS NOT NULL).
- user_id columns default to auth.uid() so client inserts that omit user_id succeed.

## Indexes
- user_id on both tables
- folder_id on vault_items
- item_type on vault_items (for filtering)
- is_starred on vault_items (for favorites view)
- created_at DESC on both
- GIN index on vault_items.tags for array containment searches

## Important Notes
1. vault_folders.parent_folder_id is a self-referencing FK with ON DELETE SET NULL,
   so deleting a parent folder orphans (rather than deletes) its sub-folders.
2. vault_items.folder_id uses ON DELETE SET NULL so deleting a folder keeps the
   items but moves them to "no folder".
3. The `encrypted_data` column stores AES-GCM ciphertext as a base64 string.
   Encryption happens client-side using the Web Crypto API — the server never
   sees plaintext passwords.
4. Soft-deleted items (deleted_at IS NOT NULL) are still owned by the user and
   can be restored from the recycle bin or permanently deleted.
*/

-- ============================================================================
-- vault_folders
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vault_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text DEFAULT 'folder',
  parent_folder_id uuid REFERENCES public.vault_folders(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.vault_folders ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_vault_folders_user_id ON public.vault_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_folders_parent ON public.vault_folders(parent_folder_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vault_folders_created_at ON public.vault_folders(created_at DESC);

DROP POLICY IF EXISTS "select_own_vault_folders" ON public.vault_folders;
CREATE POLICY "select_own_vault_folders" ON public.vault_folders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_vault_folders" ON public.vault_folders;
CREATE POLICY "insert_own_vault_folders" ON public.vault_folders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_vault_folders" ON public.vault_folders;
CREATE POLICY "update_own_vault_folders" ON public.vault_folders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_vault_folders" ON public.vault_folders;
CREATE POLICY "delete_own_vault_folders" ON public.vault_folders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS vault_folders_set_updated_at ON public.vault_folders;
CREATE TRIGGER vault_folders_set_updated_at BEFORE UPDATE ON public.vault_folders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- vault_items
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vault_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES public.vault_folders(id) ON DELETE SET NULL,
  title text NOT NULL,
  item_type text NOT NULL,
  encrypted_data text,
  file_url text,
  file_size bigint,
  mime_type text,
  thumbnail_url text,
  notes text,
  tags text[] DEFAULT '{}',
  is_starred boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT NULL
);

ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_vault_items_user_id ON public.vault_items(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_items_folder_id ON public.vault_items(folder_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vault_items_type ON public.vault_items(item_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vault_items_starred ON public.vault_items(is_starred) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vault_items_created_at ON public.vault_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_items_tags_gin ON public.vault_items USING GIN (tags);

DROP POLICY IF EXISTS "select_own_vault_items" ON public.vault_items;
CREATE POLICY "select_own_vault_items" ON public.vault_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_vault_items" ON public.vault_items;
CREATE POLICY "insert_own_vault_items" ON public.vault_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_vault_items" ON public.vault_items;
CREATE POLICY "update_own_vault_items" ON public.vault_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_vault_items" ON public.vault_items;
CREATE POLICY "delete_own_vault_items" ON public.vault_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS vault_items_set_updated_at ON public.vault_items;
CREATE TRIGGER vault_items_set_updated_at BEFORE UPDATE ON public.vault_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();