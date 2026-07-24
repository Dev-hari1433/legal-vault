/*
# Create vault-files storage bucket

## Summary
Creates a public Supabase Storage bucket named `vault-files` for storing
user-uploaded files in the Digital Vault (documents, photos, videos, IDs, etc.).
Storage policies ensure each authenticated user can only manage files inside
their own folder (`vault-files/<user_id>/`).

## Storage Policies
1. **SELECT** — public read access (files are displayed in the app).
2. **INSERT** — authenticated users can upload only to their own folder.
3. **UPDATE** — authenticated users can update only files in their own folder.
4. **DELETE** — authenticated users can delete only files in their own folder.

## Notes
1. The bucket is public so file URLs work in <img>/<video> tags without signed URLs.
2. Folder structure: `vault-files/<auth.uid()>/<item_id>-<filename>`
3. Uses `(storage.foldername(name))[1]` to extract the user_id folder prefix.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('vault-files', 'vault-files', true)
ON CONFLICT (id) DO NOTHING;

-- SELECT: public read
DROP POLICY IF EXISTS "vault_files_public_read" ON storage.objects;
CREATE POLICY "vault_files_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vault-files');

-- INSERT: only owner can upload to their folder
DROP POLICY IF EXISTS "vault_files_insert_own" ON storage.objects;
CREATE POLICY "vault_files_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vault-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: only owner can update their folder
DROP POLICY IF EXISTS "vault_files_update_own" ON storage.objects;
CREATE POLICY "vault_files_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vault-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'vault-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: only owner can delete their folder
DROP POLICY IF EXISTS "vault_files_delete_own" ON storage.objects;
CREATE POLICY "vault_files_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vault-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);